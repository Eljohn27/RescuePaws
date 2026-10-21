import { body, query } from "express-validator";
import { str, email, oneOf, idParam, pagination, personName, phone11, landmark } from "./common.js";
import { DAGUPAN_CODE, DAGUPAN_BARANGAY_CODES } from "../utils/pangasinanLocations.js";

export const submit = [
  idParam("id"),
  personName("fullName", "Full name"),
  phone11("phone"),
  email("email"),
  body("email").custom((value) => typeof value === "string" && value.toLowerCase().endsWith("@gmail.com")).withMessage("Use a Gmail address ending in @gmail.com"),
  oneOf("cityMunicipalityCode", "City", [DAGUPAN_CODE], { required: true }),
  oneOf("barangayCode", "Barangay", [...DAGUPAN_BARANGAY_CODES], { required: true }),
  landmark("streetLandmark"),
  str("workMode", "Work mode", { max: 60 }),
  str("housingType", "Housing type", { max: 60 }),
  str("ownershipStatus", "Ownership status", { max: 60 }),
  str("yardType", "Yard type", { max: 60 }),
  body("allowPetsConfirmed").optional().isBoolean().withMessage("allowPetsConfirmed must be true or false").toBoolean(),
  str("currentPets", "Current pets", { max: 60 }),
  str("hoursAlone", "Hours alone", { max: 60 }),
  str("vetCareCommitted", "Vet care answer", { max: 120 }),
  str("experience", "Experience", { max: 120 }),
  str("notes", "Notes", { max: 1000 }),
];

export const review = [
  idParam("id"),
  oneOf("status", "Status", ["Approved", "Rejected"], { required: true }),
  str("reviewNote", "Review note", { max: 500 }),
];

export const listAll = [
  ...pagination,
  query("status").optional().isIn(["Needs Review", "Approved", "Rejected"]).withMessage("Invalid status"),
];

export const idOnly = [idParam("id")];
