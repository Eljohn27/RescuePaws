import { body } from "express-validator";
import { personName, phone11, password, str, image, roleList } from "./common.js";
import { SELF_ROLES } from "../utils/roles.js";

const challengeToken = body("challengeToken").isString().isLength({ min: 20, max: 2048 }).withMessage("Password change session is invalid");

export const updateMe = [
  personName("name", "Name").optional(),
  phone11("phone").optional(),
  str("location", "Location", { max: 100 }),
  image("avatar"),
  ...roleList("roles", SELF_ROLES, { required: false }),
];

// Step 1: check the current password and the new one, then email a code
export const requestPasswordChange = [
  body("currentPassword")
    .isString().withMessage("Current password is required").bail()
    .isLength({ min: 1, max: 72 }).withMessage("Current password is required"),
  password("newPassword", "New password"),
  body("newPassword")
    .custom((v, { req }) => v !== req.body.currentPassword)
    .withMessage("New password must be different from the current one"),
];

export const resendPasswordChange = [challengeToken];

// Step 2: the emailed code applies the change
export const confirmPasswordChange = [
  challengeToken,
  body("otp").isString().matches(/^[0-9]{6}$/).withMessage("Enter the 6-digit code from your email"),
];

export const resendAccountDeletion = [
  body("challengeToken").isString().isLength({ min: 20, max: 2048 }).withMessage("Account deletion session is invalid"),
];

export const confirmAccountDeletion = [
  body("challengeToken").isString().isLength({ min: 20, max: 2048 }).withMessage("Account deletion session is invalid"),
  body("otp").isString().matches(/^[0-9]{6}$/).withMessage("Enter the 6-digit code from your email"),
];
