import express from "express";
import { register, verifyRegistrationOtp, resendRegistrationOtp, login, forgotPassword, resendResetOtp, resetPassword, getMe, logout } from "../controllers/authController.js";
import * as v from "../validators/authValidators.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";
import { loginLimiter, registerLimiter, resendOtpLimiter, resendRegistrationOtpLimiter, verifyRegistrationOtpLimiter, forgotPasswordLimiter, resetPasswordLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

router.post("/register", registerLimiter, v.register, validate, register);
router.post("/verify-registration-otp", verifyRegistrationOtpLimiter, v.verifyRegistrationOtp, validate, verifyRegistrationOtp);
router.post("/resend-registration-otp", resendRegistrationOtpLimiter, v.resendRegistrationOtp, validate, resendRegistrationOtp);
router.post("/login", loginLimiter, v.login, validate, login);
router.post("/forgot-password", forgotPasswordLimiter, v.forgotPassword, validate, forgotPassword);
router.post("/resend-reset-otp", resendOtpLimiter, v.resendResetOtp, validate, resendResetOtp);
router.post("/reset-password", resetPasswordLimiter, v.resetPassword, validate, resetPassword);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

export default router;
