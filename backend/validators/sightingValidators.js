import { body, query } from "express-validator";
import { str, oneOf, image, phoneAny, idParam, pagination } from "./common.js";

const ANIMALS = ["Dog", "Cat"];
const CONDITIONS = ["Appears Healthy", "Needs Vet Care", "Trapped or Scared", "Calm / Eating"];
const RESCUE = ["Spotted", "Needs Foster", "Rescue Resolved"];
const MODERATION = ["Approved", "Rejected", "Rescued"];

const spottedAt = body("spottedAt")
  .optional()
  .isISO8601().withMessage("spottedAt must be a valid date")
  .bail()
  .toDate()
  .custom((d) => d.getTime() <= Date.now() + 5 * 60 * 1000).withMessage("spottedAt cannot be in the future");

const optionalFields = [
  str("keyFeatures", "Key features", { max: 200 }),
  image("photoUrl"),
  spottedAt,
  str("notes", "Notes", { max: 1000 }),
  phoneAny("reporterPhone"),
  body("receiveUpdates").optional().isBoolean().withMessage("receiveUpdates must be true or false").toBoolean(),
  oneOf("postStatus", "Post status", ["draft", "published"]),
];

export const create = [
  oneOf("animalType", "Animal type", ANIMALS, { required: true }),
  str("approximateSize", "Approximate size", { required: true, max: 60 }),
  str("location", "Location", { required: true, min: 2, max: 200 }),
  oneOf("condition", "Condition", CONDITIONS, { required: true }),
  ...optionalFields,
];

export const update = [
  idParam("id"),
  oneOf("animalType", "Animal type", ANIMALS),
  str("approximateSize", "Approximate size", { max: 60 }),
  str("location", "Location", { min: 2, max: 200 }),
  oneOf("condition", "Condition", CONDITIONS),
  oneOf("rescueStatus", "Rescue status", RESCUE), // only admins may change it (checked in controller)
  ...optionalFields,
];

export const list = [
  ...pagination,
  query("rescueStatus").optional().isIn(RESCUE).withMessage("Invalid rescueStatus"),
  query("animalType").optional().isIn(ANIMALS).withMessage("Invalid animalType"),
];

export const adminList = [
  ...pagination,
  query("moderationStatus").optional().isIn(["Pending for Approval", ...MODERATION]).withMessage("Invalid moderationStatus"),
  query("animalType").optional().isIn(ANIMALS).withMessage("Invalid animalType"),
];

export const moderate = [idParam("id"), oneOf("moderationStatus", "moderationStatus", MODERATION, { required: true })];
export const idOnly = [idParam("id")];
