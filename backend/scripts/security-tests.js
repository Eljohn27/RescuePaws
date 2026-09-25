// Security test runner for the project's "Security Testing" deliverable.
//
//   npm run test:security                                   (against http://localhost:5000/api)
//   API_URL=https://your-api.onrender.com/api npm run test:security
//
// SAFETY: run this ONLY against your own application. Needs the seeded test accounts (npm run seed).
// The last test intentionally trips the login rate limiter, so this IP is blocked from logging in for the
// rate-limit window (default 15 minutes) afterwards.
const API = (process.env.API_URL || "http://localhost:5000/api").replace(/\/$/, "");
const ACCOUNTS = {
  admin: { email: process.env.TEST_ADMIN_EMAIL || "admin@test.com", password: process.env.TEST_ADMIN_PASSWORD || "Admin@12345" },
  reporter: { email: process.env.TEST_REPORTER_EMAIL || "reporter@test.com", password: process.env.TEST_REPORTER_PASSWORD || "Reporter@12345" },
  adopter: { email: process.env.TEST_ADOPTER_EMAIL || "adopter@test.com", password: process.env.TEST_ADOPTER_PASSWORD || "Adopter@12345" },
};

const call = async (method, path, { token, body, raw, headers = {} } = {}) => {
  const h = { ...headers };
  if (token) h.Authorization = `Bearer ${token}`;
  let payload = raw;
  if (body !== undefined) { payload = JSON.stringify(body); h["Content-Type"] = "application/json"; }
  else if (raw !== undefined) h["Content-Type"] = "application/json";
  const res = await fetch(API + path, { method, headers: h, body: payload });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch (e) { /* not json */ }
  return { status: res.status, headers: res.headers, text, json };
};

const rows = [];
const record = (test, expected, actual, pass) => {
  rows.push({ test, expected, actual, pass });
  console.log(`${pass ? "PASS" : "FAIL"}  ${test}  (expected ${expected}, got ${actual})`);
};
const expectStatus = (test, expected, res) => record(test, String(expected), String(res.status), res.status === expected);

const login = async (who) => {
  const r = await call("POST", "/auth/login", { body: ACCOUNTS[who] });
  if (r.status !== 200) throw new Error(`Could not log in as the ${who} test account (${r.status}). Did you run "npm run seed"?`);
  return r.json.token;
};

const sightingBody = { animalType: "Dog", approximateSize: "Small", location: "Security test spot", condition: "Calm / Eating", notes: "Created by security-tests.js", reporterPhone: "09170000002" };

try {
  const health = await call("GET", "/health");
  if (health.status !== 200) throw new Error(`API not reachable at ${API} (status ${health.status})`);
  console.log(`Testing ${API}\n`);

  const [adminToken, reporterToken, adopterToken] = [await login("admin"), await login("reporter"), await login("adopter")];

  // ---- the tests listed in the guidelines ----
  expectStatus("Invalid registration data", 400, await call("POST", "/auth/register", { body: { name: "x", email: "not-an-email", password: "1" } }));
  expectStatus("Invalid login", 401, await call("POST", "/auth/login", { body: { email: ACCOUNTS.adopter.email, password: "Wrong-Pass-1" } }));
  expectStatus("Access admin route as User", 403, await call("GET", "/admin/stats", { token: adopterToken }));
  expectStatus("Missing JWT", 401, await call("GET", "/auth/me"));
  expectStatus("Invalid JWT", 403, await call("GET", "/auth/me", { token: "not.a.valid-token" }));

  const created = await call("POST", "/sightings", { token: reporterToken, body: sightingBody });
  if (created.status !== 201) throw new Error(`Could not create a test sighting as the reporter (${created.status}).`);
  const sightingId = created.json._id;
  expectStatus("Unauthorized DELETE (another user's sighting)", 403, await call("DELETE", `/sightings/${sightingId}`, { token: adopterToken }));
  expectStatus("Invalid MongoDB ID", 400, await call("GET", "/sightings/not-a-valid-id"));

  // ---- additional checks ----
  expectStatus("Privilege escalation at sign-up (roles: admin)", 400, await call("POST", "/auth/register", { body: { name: "Eve Test", email: "eve@test.com", phone: "09171112222", password: "Passw0rd!x", roles: ["admin"], termsAccepted: true } }));
  expectStatus("NoSQL injection in login", 400, await call("POST", "/auth/login", { body: { email: { $ne: null }, password: "x" } }));
  expectStatus("Adopter cannot report sightings (RBAC)", 403, await call("POST", "/sightings", { token: adopterToken, body: sightingBody }));
  expectStatus("Reporter cannot moderate sightings (RBAC)", 403, await call("PATCH", `/sightings/${sightingId}/moderate`, { token: reporterToken, body: { moderationStatus: "Approved" } }));

  const hidden = await call("GET", `/sightings/${sightingId}`);
  expectStatus("Unapproved sighting is hidden from the public", 404, hidden);
  await call("PATCH", `/sightings/${sightingId}/moderate`, { token: adminToken, body: { moderationStatus: "Approved" } });
  const visible = await call("GET", `/sightings/${sightingId}`);
  record("Approved sighting is public but hides reporter phone", "200 + no phone", `${visible.status}${visible.json && "reporterPhone" in visible.json ? " + phone leaked" : ""}`, visible.status === 200 && !("reporterPhone" in visible.json));

  const hdr = (await call("GET", "/health")).headers;
  record("Security headers (Helmet)", "present", hdr.get("x-content-type-options") && hdr.get("strict-transport-security") && hdr.get("content-security-policy") && !hdr.get("x-powered-by") ? "present" : "missing", !!(hdr.get("x-content-type-options") && hdr.get("strict-transport-security") && hdr.get("content-security-policy") && !hdr.get("x-powered-by")));
  const bad = await call("POST", "/auth/login", { raw: "{not json" });
  record("Errors hide internals (no stack traces / paths)", "400, no internals", `${bad.status}${/stack|node_modules|SyntaxError|\/home\/|\\Users\\/i.test(bad.text) ? ", LEAK" : ""}`, bad.status === 400 && !/stack|node_modules|SyntaxError|\/home\/|\\Users\\/i.test(bad.text));

  // cleanup: the reporter deletes their own test sighting (also proves owner-delete works)
  expectStatus("Owner can delete own sighting", 200, await call("DELETE", `/sightings/${sightingId}`, { token: reporterToken }));

  // ---- LAST: trips the login rate limiter ----
  let limited = 0, attempts = 0;
  for (; attempts < 60 && !limited; attempts++) {
    const r = await call("POST", "/auth/login", { body: { email: `ratelimit-${Date.now()}@test.com`, password: "Wrong-Pass-1" } });
    if (r.status === 429) limited = attempts + 1;
  }
  record("Excessive login requests", "Rate limited (429)", limited ? `Blocked after ${limited} attempts` : `Not blocked after ${attempts} attempts`, !!limited);
} catch (err) {
  console.error(`\nTest run aborted: ${err.message}`);
  process.exit(2);
}

const failed = rows.filter((r) => !r.pass);
console.log("\n| Test | Expected Result | Actual Result | Status |\n|---|---|---|---|");
for (const r of rows) console.log(`| ${r.test} | ${r.expected} | ${r.actual} | ${r.pass ? "PASS" : "FAIL"} |`);
console.log(`\n${rows.length - failed.length}/${rows.length} passed${failed.length ? " - FAILURES ABOVE" : ""}`);
process.exit(failed.length ? 1 : 0);
