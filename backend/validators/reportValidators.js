import { body, query } from "express-validator";
import { idParam, oneOf, str, pagination } from "./common.js";
import { REPORT_REASONS } from "../models/Report.js";

export const create = [
  oneOf("targetType", "Post type", ["sighting", "adoption"], { required: true }),
  body("targetId").isMongoId().withMessage("Invalid post"),
  oneOf("reason", "Reason", REPORT_REASONS, { required: true }),
  str("details", "Details", { max: 300 }),
];

export const list = [
  ...pagination,
  query("status").optional().isIn(["Open", "Dismissed", "Actioned"]).withMessage("Invalid status"),
];

export const review = [
  idParam("id"),
  oneOf("action", "Action", ["dismiss", "takedown"], { required: true }),
  str("reviewNote", "Reason", { max: 500 }),
  body("reviewNote").custom((v, { req }) => req.body.action !== "takedown" || (typeof v === "string" && v.trim().length >= 3))
    .withMessage("Tell the poster why the post is being taken down (at least 3 characters)"),
];
