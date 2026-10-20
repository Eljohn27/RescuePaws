import { body, query } from "express-validator";
import { str, oneOf, image, idParam, pagination, petName, landmark } from "./common.js";
import petOptions from "../../frontend/src/data/petOptions.json" with { type: "json" };
import { DAGUPAN_CODE, formatPangasinanLocation, isInDagupan, resolveDagupanBarangay } from "../utils/pangasinanLocations.js";

const ANIMALS = ["Dog", "Cat"];
const { ages: AGES, dogBreeds: DOG_BREEDS, catBreeds: CAT_BREEDS } = petOptions;
const BREEDS_FOR = { Dog: DOG_BREEDS, Cat: CAT_BREEDS };
const STATUSES = ["Ready for Home", "In Foster Care", "Needs Medical Care First", "Adopted"];
const STATUS_KEYS = ["ready", "foster", "medical", "adopted"];
const coordinates = [
  body("latitude").optional().isFloat({ min: 12, max: 21.5 }).withMessage("Latitude must be within Pangasinan").toFloat()
    .custom((latitude, { req }) => isInDagupan(latitude, req.body.longitude)).withMessage("Map pin must be inside the Dagupan City map area"),
  body("longitude").optional().isFloat({ min: 119, max: 125.5 }).withMessage("Longitude must be within Pangasinan").toFloat(),
  body("latitude").custom((v, { req }) => (v === undefined) === (req.body.longitude === undefined)).withMessage("Both map coordinates must be provided together"),
];
const dagupanLocation = [
  body("cityMunicipalityCode").isString().withMessage("Choose Dagupan City").bail()
    .custom((code) => code === DAGUPAN_CODE).withMessage("Posts must be located in Dagupan City"),
  body("barangayCode").isString().withMessage("Choose a barangay").bail()
    .custom((code, { req }) => !!resolveDagupanBarangay(req.body.cityMunicipalityCode, code)).withMessage("Choose one of Dagupan City's barangays"),
  landmark("streetLandmark"),
];

// Breed is "Primary" or "Primary + Second" (a mix). Every part must belong to the chosen animal's breed list.
const breedField = (required) => {
  let chain = body("breed");
  if (!required) chain = chain.optional();
  return chain
    .isString().withMessage("Choose a breed").bail()
    .trim()
    .custom((value, { req }) => {
      const list = BREEDS_FOR[req.body.animalType] || [...DOG_BREEDS, ...CAT_BREEDS];
      const parts = value.split(" + ");
      return parts.length >= 1 && parts.length <= 2 && parts.every((p) => list.includes(p)) && new Set(parts).size === parts.length;
    })
    .withMessage("Choose a breed that matches the animal (a second breed must be different)");
};

const fields = (required) => [
  petName("petName", { required }),
  oneOf("animalType", "Animal type", ANIMALS, { required }),
  oneOf("gender", "Gender", ["Male", "Female"], { required }),
  oneOf("age", "Age", AGES, { required }),
  breedField(required),
  str("description", "Description", { max: 1500 }),
  ...dagupanLocation,
  str("location", "Location", { required: true, min: 2, max: 200 }),
  body("location").custom((_, { req }) => formatPangasinanLocation(req.body.cityMunicipalityCode, req.body.barangayCode, req.body.streetLandmark).length <= 200)
    .withMessage("The selected location and optional street or landmark must be 200 characters or fewer"),
  image("photoUrl"),
];

export const create = [...fields(true), ...coordinates, oneOf("listingStatus", "Listing status", STATUSES.slice(0, 3))];
export const update = [idParam("id"), ...fields(false), ...coordinates, oneOf("listingStatus", "Listing status", STATUSES)];

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

// Rejecting / taking a post down needs a reason, because the poster is sent that message.
export const moderate = [
  idParam("id"),
  oneOf("moderationStatus", "moderationStatus", MODERATION, { required: true }),
  str("reviewNote", "Reason", { max: 500 }),
  body("reviewNote").custom((v, { req }) => req.body.moderationStatus !== "Rejected" || (typeof v === "string" && v.trim().length >= 3))
    .withMessage("Tell the poster why this post is being rejected (at least 3 characters)"),
];
