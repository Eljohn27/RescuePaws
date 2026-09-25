// Loads and validates environment variables. Secrets are NEVER hard-coded.
// NOTE: this module runs dotenv itself, so any file that imports it gets a fully-loaded environment.
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const isProd = process.env.NODE_ENV === "production";

// MONGODB_URI is the name used in the project guidelines; MONGO_URI (your old name) still works.
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const jwtSecret = process.env.JWT_SECRET;

const missing = [];
if (!mongoUri) missing.push("MONGODB_URI");
if (!jwtSecret) missing.push("JWT_SECRET");
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(", ")}. See .env.example.`);
  process.exit(1);
}

if (jwtSecret.length < 32) {
  const msg =
    "JWT_SECRET is shorter than 32 characters. Generate a strong one with:\n" +
    "  node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\"";
  if (isProd) {
    console.error(msg);
    process.exit(1);
  }
  console.warn(`WARNING: ${msg}`);
}

const int = (v, fallback) => (Number.isInteger(Number(v)) && Number(v) > 0 ? Number(v) : fallback);
const splitOrigins = (v) => (v || "").split(",").map((s) => s.trim().replace(/\/$/, "")).filter(Boolean);

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProd,
  port: int(process.env.PORT, 5000),
  mongoUri,
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  bcryptRounds: int(process.env.BCRYPT_ROUNDS, 12),
  // CORS allow-list: the main site and the admin site
  clientOrigins: [
    ...new Set([
      ...splitOrigins(process.env.CLIENT_URL || "http://localhost:5173"),
      ...splitOrigins(process.env.ADMIN_CLIENT_URL || "http://localhost:5174"),
    ]),
  ],
  apiRateLimitMax: int(process.env.API_RATE_LIMIT_MAX, 300),
  authRateLimitMax: int(process.env.AUTH_RATE_LIMIT_MAX, 10),
  authRateLimitWindowMin: int(process.env.AUTH_RATE_LIMIT_WINDOW_MIN, 15),
  // Account lockout: after this many failed logins in a row, the account is
  // locked for lockoutMinutes. Both have safe defaults, so no .env change is required.
  maxLoginAttempts: int(process.env.MAX_LOGIN_ATTEMPTS, 5),
  lockoutMinutes: int(process.env.LOCKOUT_MINUTES, 15),
};

export default env;
