import { body } from "express-validator";
import { personName, phone11, password, str, image, roleList } from "./common.js";
import { SELF_ROLES } from "../utils/roles.js";

export const updateMe = [
  personName("name", "Name").optional(),
  phone11("phone").optional(),
  str("location", "Location", { max: 100 }),
  image("avatar"),
  ...roleList("roles", SELF_ROLES, { required: false }),
];

export const changePassword = [
  body("currentPassword")
    .isString().withMessage("Current password is required").bail()
    .isLength({ min: 1, max: 72 }).withMessage("Current password is required"),
  password("newPassword", "New password"),
  body("newPassword")
    .custom((v, { req }) => v !== req.body.currentPassword)
    .withMessage("New password must be different from the current one"),
];
