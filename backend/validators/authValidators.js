import { body } from "express-validator";
import { personName, email, password, phone11, roleList } from "./common.js";
import { SELF_ROLES } from "../utils/roles.js";

const challengeToken = (message) => body("challengeToken").isString().isLength({ min: 20, max: 2048 }).withMessage(message);
const sixDigits = body("otp").isString().matches(/^[0-9]{6}$/).withMessage("Enter the 6-digit code from your email");

export const register = [
  personName("name", "Full name"),
  email("email"),
  body("email").custom((value) => typeof value === "string" && value.toLowerCase().endsWith("@gmail.com")).withMessage("Use a Gmail address ending in @gmail.com"),
  phone11("phone"),
  password("password"),
  ...roleList("roles", SELF_ROLES), // "admin" can never be requested at sign-up
  body("termsAccepted").custom((v) => v === true).withMessage("You must agree to the terms to create an account"),
];

// Signing in is password-only. The emailed code is used for sign-up, password reset and password change.
export const login = [
  email("email"),
  body("password")
    .isString().withMessage("Password is required").bail()
    .notEmpty().withMessage("Password is required")
    .isLength({ max: 72 }).withMessage("Password is required"),
];

export const verifyRegistrationOtp = [challengeToken("Sign-up verification session is invalid"), sixDigits];
export const resendRegistrationOtp = [challengeToken("Sign-up verification session is invalid")];

// Forgot password: 1) email -> code  2) code + new password
export const forgotPassword = [email("email")];
export const resendResetOtp = [challengeToken("Password reset session is invalid")];
export const resetPassword = [
  challengeToken("Password reset session is invalid"),
  sixDigits,
  password("newPassword", "New password"),
];
