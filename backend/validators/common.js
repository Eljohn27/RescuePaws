// Shared express-validator building blocks. External input is untrusted: every field is type-checked,
// trimmed, length-limited and (where possible) checked against an allow-list.
import { body, param, query } from "express-validator";

const IMAGE_PATH = /^\/[A-Za-z0-9._\-/]{1,200}$/;
const PHONE_ANY = /^[0-9+()\-.\s]{7,20}$/;
const PERSON_NAME = /^[\p{L}\p{M} .'’-]+$/u;

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

export const personName = (field = "name", label = "Name") =>
  body(field)
    .isString().withMessage(`${label} is required`).bail()
    .trim()
    .notEmpty().withMessage(`${label} is required`)
    .isLength({ min: 2, max: 60 }).withMessage(`${label} must be between 2 and 60 characters`)
    .matches(PERSON_NAME).withMessage(`${label} can only contain letters, spaces, periods, hyphens, and apostrophes`);

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
    .isLength({ min: 8 }).withMessage(`${label} must be at least 8 characters`)
    .custom((v) => Buffer.byteLength(v, "utf8") <= 72).withMessage(`${label} must be at most 72 characters`)
    .matches(/[a-z]/).withMessage(`${label} must contain at least one lowercase letter`)
    .matches(/[A-Z]/).withMessage(`${label} must contain at least one uppercase letter`)
    .matches(/[0-9]/).withMessage(`${label} must contain at least one number`);

export const phone11 = (field = "phone") =>
  body(field)
    .isString().withMessage("Phone number must be 11 digits, numbers only").bail()
    .trim()
    .matches(/^[0-9]{11}$/).withMessage("Phone number must be 11 digits, numbers only");

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
