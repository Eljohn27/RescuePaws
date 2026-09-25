import express from "express";
import { register, login, getMe, logout } from "../controllers/authController.js";
import * as v from "../validators/authValidators.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";
import { loginLimiter, registerLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

router.post("/register", registerLimiter, v.register, validate, register);
router.post("/login", loginLimiter, v.login, validate, login);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

export default router;
