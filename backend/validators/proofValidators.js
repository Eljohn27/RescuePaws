import { body, query } from "express-validator";
import { str, requiredImage, oneOf, idParam, pagination } from "./common.js";

export const submit = [
  idParam("id"),
  requiredImage("photoUrl"),
  str("message", "Message", { required: true, min: 3, max: 500 }),
];

export const review = [
  idParam("id"),
  oneOf("status", "Status", ["Approved", "Rejected"], { required: true }),
  str("reviewNote", "Reason", { max: 500 }),
  body("reviewNote").custom((v, { req }) => req.body.status !== "Rejected" || (typeof v === "string" && v.trim().length >= 3))
    .withMessage("Tell the person why their proof is being rejected (at least 3 characters)"),
];

export const listAll = [
  ...pagination,
  query("status").optional().isIn(["Needs Review", "Approved", "Rejected"]).withMessage("Invalid status"),
];

export const idOnly = [idParam("id")];
