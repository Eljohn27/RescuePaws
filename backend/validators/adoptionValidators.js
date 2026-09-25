import { query } from "express-validator";
import { str, oneOf, image, idParam, pagination } from "./common.js";

const ANIMALS = ["Dog", "Cat"];
const STATUSES = ["Ready for Home", "In Foster Care", "Needs Medical Care First", "Adopted"];
const STATUS_KEYS = ["ready", "foster", "medical", "adopted"];

const fields = (required) => [
  str("petName", "Pet name", { required, max: 60 }),
  oneOf("animalType", "Animal type", ANIMALS, { required }),
  oneOf("gender", "Gender", ["Male", "Female"], { required }),
  str("age", "Age", { max: 40 }),
  str("breed", "Breed", { max: 100 }),
  str("description", "Description", { max: 1500 }),
  str("location", "Location", { required, min: 2, max: 150 }),
  image("photoUrl"),
];

export const create = [...fields(true), oneOf("listingStatus", "Listing status", STATUSES.slice(0, 3))];
export const update = [idParam("id"), ...fields(false), oneOf("listingStatus", "Listing status", STATUSES)];

// Filter names match the AdoptionFeed page: category=dog|cat, gender=male|female, status=ready,foster
export const list = [
  ...pagination,
  query("category").optional().isIn(["dog", "cat"]).withMessage("Invalid category"),
  query("gender").optional().isIn(["male", "female"]).withMessage("Invalid gender"),
  query("status")
    .optional()
    .isString().bail()
    .custom((v) => v.split(",").every((k) => STATUS_KEYS.includes(k)))
    .withMessage("Invalid status filter"),
];

export const idOnly = [idParam("id")];

// --- Admin approval ---
const MODERATION = ["Approved", "Rejected"];

export const adminList = [
  ...pagination,
  query("moderationStatus").optional().isIn(["Pending for Approval", ...MODERATION]).withMessage("Invalid moderationStatus"),
  query("listingStatus").optional().isIn(STATUSES).withMessage("Invalid listingStatus"),
  query("animalType").optional().isIn(ANIMALS).withMessage("Invalid animalType"),
];

export const moderate = [
  idParam("id"),
  oneOf("moderationStatus", "moderationStatus", MODERATION, { required: true }),
  str("reviewNote", "Review note", { max: 500 }),
];
