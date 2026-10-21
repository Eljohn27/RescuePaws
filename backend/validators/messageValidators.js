import { body, param, query } from "express-validator";

export const searchUsers = [
  query("q").isString().trim().isLength({ min: 2, max: 50 }).withMessage("Search must be 2 to 50 characters"),
];

export const recipient = [
  body("recipientId").isMongoId().withMessage("Choose a valid member"),
];

export const conversationId = [
  param("id").isMongoId().withMessage("Invalid conversation"),
];

export const sendMessage = [
  ...conversationId,
  body("text").isString().trim().isLength({ min: 1, max: 2000 }).withMessage("Message must be 1 to 2,000 characters"),
];
