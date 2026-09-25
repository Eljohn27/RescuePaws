import { body } from "express-validator";
import { personName, email, password, phone11, roleList } from "./common.js";
import { SELF_ROLES } from "../utils/roles.js";

export const register = [
  personName("name", "Name"),
  email("email"),
  phone11("phone"),
  password("password"),
  ...roleList("roles", SELF_ROLES), // "admin" can never be requested at sign-up
  body("termsAccepted").custom((v) => v === true).withMessage("You must agree to the terms to create an account"),
];

export const login = [
  email("email"),
  body("password")
    .isString().withMessage("Password is required").bail()
    .notEmpty().withMessage("Password is required")
    .isLength({ max: 72 }).withMessage("Password is required"),
];
