import { body, query } from "express-validator";
import { str, oneOf, image, phoneAny, idParam, pagination, markings, landmark } from "./common.js";
import { DAGUPAN_CODE, formatPangasinanLocation, isInDagupan, resolveDagupanBarangay } from "../utils/pangasinanLocations.js";

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

const dagupanLocation = [
  body("cityMunicipalityCode").isString().withMessage("Choose Dagupan City").bail()
    .custom((code) => code === DAGUPAN_CODE).withMessage("Posts must be located in Dagupan City"),
  body("barangayCode").isString().withMessage("Choose a barangay").bail()
    .custom((code, { req }) => !!resolveDagupanBarangay(req.body.cityMunicipalityCode, code)).withMessage("Choose one of Dagupan City's barangays"),
  landmark("streetLandmark"),
];

const optionalFields = [
  body("latitude").optional().isFloat({ min: 12, max: 21.5 }).withMessage("Latitude must be within Pangasinan").toFloat()
    .custom((latitude, { req }) => isInDagupan(latitude, req.body.longitude)).withMessage("Map pin must be inside the Dagupan City map area"),
  body("longitude").optional().isFloat({ min: 119, max: 125.5 }).withMessage("Longitude must be within Pangasinan").toFloat(),
  body("latitude").custom((v, { req }) => (v === undefined) === (req.body.longitude === undefined)).withMessage("Both map coordinates must be provided together"),
  markings("keyFeatures"),
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
  ...dagupanLocation,
  str("location", "Location", { required: true, min: 2, max: 200 }),
  body("location").custom((_, { req }) => formatPangasinanLocation(req.body.cityMunicipalityCode, req.body.barangayCode, req.body.streetLandmark).length <= 200)
    .withMessage("The selected location and optional street or landmark must be 200 characters or fewer"),
  oneOf("condition", "Condition", CONDITIONS, { required: true }),
  ...optionalFields,
];

export const update = [
  idParam("id"),
  oneOf("animalType", "Animal type", ANIMALS),
  str("approximateSize", "Approximate size", { max: 60 }),
  ...dagupanLocation,
  str("location", "Location", { required: true, min: 2, max: 200 }),
  body("location").custom((_, { req }) => formatPangasinanLocation(req.body.cityMunicipalityCode, req.body.barangayCode, req.body.streetLandmark).length <= 200)
    .withMessage("The selected location and optional street or landmark must be 200 characters or fewer"),
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

// Rejecting / taking a report down needs a reason, because the reporter is sent that message.
export const moderate = [
  idParam("id"),
  oneOf("moderationStatus", "moderationStatus", MODERATION, { required: true }),
  str("reviewNote", "Reason", { max: 500 }),
  body("reviewNote").custom((v, { req }) => req.body.moderationStatus !== "Rejected" || (typeof v === "string" && v.trim().length >= 3))
    .withMessage("Tell the reporter why this report is being rejected (at least 3 characters)"),
];
export const idOnly = [idParam("id")];
