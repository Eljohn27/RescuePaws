import { body, query } from "express-validator";
import { str, phoneAny, email, oneOf, idParam, pagination } from "./common.js";

export const submit = [
  idParam("id"),
  str("fullName", "Full name", { required: true, min: 2, max: 60 }),
  phoneAny("phone", { required: true }),
  email("email"),
  str("address", "Address", { required: true, min: 5, max: 200 }),
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
