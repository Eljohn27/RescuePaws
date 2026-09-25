import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

// Run after a chain of express-validator checks. Invalid data is rejected here with 400 and a clear
// list of what is wrong ({ path, msg } per field), so it never reaches the controller or database.
// The submitted value is deliberately NOT echoed back (it could be a password).
export const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const errors = result.array({ onlyFirstError: true }).map((e) => ({ path: e.path, msg: e.msg }));
  return next(new ApiError(400, "Validation failed", errors));
};

export default validate;
