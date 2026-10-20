// Shared express-validator building blocks. External input is untrusted: every field is type-checked,
// trimmed, length-limited and (where possible) checked against an allow-list.
import { body, param, query } from "express-validator";

const IMAGE_PATH = /^\/[A-Za-z0-9._\-/]{1,200}$/;
const PHONE_ANY = /^[0-9+()\-.\s]{7,20}$/;
const NAME_TOKEN = /^[\p{L}\p{M}]+(?:['’.-][\p{L}\p{M}]+)*\.?$/u;
const NAME_PARTICLES = new Set(["ma", "de", "del", "dela", "delos", "de la", "la", "las", "los", "di", "da", "van", "von", "bin", "bint", "al", "el", "y", "jr", "sr", "ii", "iii", "iv"]);
const VOWEL = /[aeiouyáéíóúàèìòùäëïöüâêîôû]/i;

// http(s) URL or a site-relative path such as /bruno.jpg  (no data: or javascript: URLs)
const isSafeImage = (v) => {
  if (v === "") return true;
  if (IMAGE_PATH.test(v)) return true;
  try {
    const u = new URL(v);
    return (u.protocol === "http:" || u.protocol === "https:") && v.length <= 2048;
  } catch (e) {
    return false;
  }
};

// Text field: string, trimmed, length-limited. `required` decides whether it may be missing.
export function str(field, label, { required = false, min = 0, max = 255 } = {}) {
  const lo = required ? Math.max(min, 1) : min;
  let chain = body(field);
  if (!required) chain = chain.optional();
  return chain
    .isString().withMessage(`${label} must be text`).bail()
    .trim()
    .isLength({ min: lo, max })
    .withMessage(`${label} must be ${lo > 0 ? `between ${lo} and ${max}` : `at most ${max}`} characters`);
}

// Value must be one of `values` (allow-list)
export const oneOf = (field, label, values, { required = false } = {}) => {
  let chain = body(field);
  if (!required) chain = chain.optional();
  return chain
    .isString().withMessage(`${label} is invalid`).bail()
    .isIn(values).withMessage(`${label} must be one of: ${values.join(", ")}`);
};

export const image = (field = "photoUrl") =>
  body(field).optional().isString().withMessage("Photo must be text").bail().trim()
    .custom(isSafeImage).withMessage("Photo must be an http(s) URL or a site-relative path");

// Same as image() but the photo must be provided
export const requiredImage = (field = "photoUrl") =>
  body(field)
    .isString().withMessage("A photo is required").bail().trim()
    .notEmpty().withMessage("A photo is required").bail()
    .custom(isSafeImage).withMessage("Photo must be an http(s) URL or a site-relative path");

// Any reasonable phone format (sighting reports, adoption requests)
export const phoneAny = (field = "phone", { required = false } = {}) => {
  let chain = body(field);
  if (!required) chain = chain.optional();
  return chain
    .isString().withMessage("Phone must be text").bail().trim()
    .custom((v) => (v === "" ? !required : PHONE_ANY.test(v))).withMessage("Enter a valid phone number");
};

// Why a "full name" is not acceptable, or "" when it is.
// Rejects initials ("J. C."), keyboard mash ("hj", "jk") and one-word names, so "el hj" can never pass as a person's name.
export function fullNameProblem(value) {
  const name = String(value ?? "").trim();
  if (name.length < 5 || name.length > 50) return "must be between 5 and 50 characters";
  if (/\s{2,}/.test(name)) return "cannot contain consecutive spaces";
  const tokens = name.split(" ");
  if (tokens.some((t) => !NAME_TOKEN.test(t))) return "can only contain letters, spaces, periods, hyphens, and apostrophes";
  const middleInitials = tokens
    .map((token, index) => ({ token, index }))
    .filter(({ token, index }) => index > 0 && index < tokens.length - 1 && /^[\p{L}\p{M}]\.?$/u.test(token));
  if (middleInitials.length > 1) return "must have no more than one middle initial";
  const middleInitialIndexes = new Set(middleInitials.map(({ index }) => index));
  const core = tokens.filter((t, index) => !middleInitialIndexes.has(index) && !NAME_PARTICLES.has(t.toLowerCase().replace(/\./g, "")));
  if (core.length < 2) return "must include your first name and last name, not initials";
  const letters = (t) => t.replace(/[^\p{L}\p{M}]/gu, "");
  if (letters(core[0]).length < 3) return "must start with a first name of at least 3 letters, not initials";
  if (core.some((t) => letters(t).length < 2 || !VOWEL.test(t) || /(\p{L})\1{2,}/iu.test(t))) return "must be a real first and last name, not initials or random letters";
  return "";
}

export const personName = (field = "name", label = "Name") =>
  body(field)
    .isString().withMessage(`${label} is required`).bail()
    .trim()
    .notEmpty().withMessage(`${label} is required`).bail()
    .custom((v) => {
      const problem = fullNameProblem(v);
      if (problem) throw new Error(`${label} ${problem}`);
      return true;
    });

// Pet names: letters and single spaces only, 2-30 characters.
const PET_NAME = /^[\p{L}\p{M}]+(?: [\p{L}\p{M}]+)*$/u;
export const petName = (field = "petName", { required = false } = {}) => {
  let chain = body(field);
  if (!required) chain = chain.optional();
  return chain
    .isString().withMessage("Pet name must be text").bail()
    .trim()
    .isLength({ min: 2, max: 30 }).withMessage("Pet name must be between 2 and 30 characters").bail()
    .matches(PET_NAME).withMessage("Pet name can only contain letters and single spaces");
};

// Colour / markings: letters, spaces, commas and hyphens only (no numbers or symbols).
const MARKINGS = /^[\p{L}\p{M}]+(?:[ ,-]+[\p{L}\p{M}]+)*$/u;
export const markings = (field = "keyFeatures") =>
  body(field)
    .optional()
    .isString().withMessage("Color / markings must be text").bail()
    .trim()
    .custom((v) => v === "" || (v.length >= 3 && v.length <= 100 && MARKINGS.test(v)))
    .withMessage("Color / markings must be 3-100 characters: letters, spaces, commas and hyphens only");

// Street or landmark: optional, but when given 3-100 characters, letters / numbers / spaces / , . - only.
const LANDMARK = /^[\p{L}\p{M}0-9][\p{L}\p{M}0-9 ,.\-]*$/u;
export const landmark = (field = "streetLandmark") =>
  body(field)
    .optional()
    .isString().withMessage("Street or landmark must be text").bail()
    .trim()
    .custom((v) => v === "" || (v.length >= 3 && v.length <= 100 && LANDMARK.test(v) && !/\s{2,}/.test(v)))
    .withMessage("Street or landmark must be 3-100 characters: letters, numbers, spaces, commas, periods and hyphens only");

// Same email handling as the original routes (normalizeEmail with defaults)
export const email = (field = "email") =>
  body(field)
    .isString().withMessage("A valid email is required").bail()
    .trim()
    .isLength({ max: 254 }).withMessage("A valid email is required").bail()
    .isEmail().withMessage("A valid email is required")
    .normalizeEmail();

// Same password rules as the original routes, plus bcrypt's 72-byte limit
export const password = (field = "password", label = "Password") =>
  body(field)
    .isString().withMessage(`${label} is required`).bail()
    .custom((v) => !/\s/.test(v)).withMessage(`${label} cannot contain spaces`)
    .isLength({ min: 8 }).withMessage(`${label} must be at least 8 characters`)
    .custom((v) => v.length <= 64 && Buffer.byteLength(v, "utf8") <= 72).withMessage(`${label} must be at most 64 characters`)
    .matches(/[a-z]/).withMessage(`${label} must contain at least one lowercase letter`)
    .matches(/[A-Z]/).withMessage(`${label} must contain at least one uppercase letter`)
    .matches(/[0-9]/).withMessage(`${label} must contain at least one number`);

export const phone11 = (field = "phone") =>
  body(field)
    .isString().withMessage("Enter a Philippine mobile number: 11 digits starting with 09").bail()
    .trim()
    .matches(/^09[0-9]{9}$/).withMessage("Enter a Philippine mobile number: 11 digits starting with 09");

export const roleList = (field, allowed, { required = true } = {}) => {
  let chain = body(field);
  if (!required) chain = chain.optional();
  return [
    chain.isArray({ min: 1, max: allowed.length }).withMessage(`Select at least one role (${allowed.join(" and/or ")})`),
    body(`${field}.*`).isString().bail().isIn(allowed).withMessage(`Roles must be: ${allowed.join(", ")}`),
  ];
};

export const idParam = (name = "id") => param(name).isMongoId().withMessage("Invalid ID");

export const pagination = [
  query("page").optional().isInt({ min: 1, max: 10000 }).withMessage("Invalid page").toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Invalid limit").toInt(),
];
