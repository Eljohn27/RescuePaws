import express from "express";
import { updateMe, requestPasswordChange, resendPasswordChange, changePassword, requestAccountDeletion, resendAccountDeletionOtp, deleteMe, getPublicProfile } from "../controllers/userController.js";
import * as v from "../validators/userValidators.js";
import { idParam } from "../validators/common.js";
import { validate } from "../middleware/validate.js";
import { protect, optionalAuth } from "../middleware/auth.js";
import { passwordChangeLimiter, resendOtpLimiter, resetPasswordLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

router.patch("/me", protect, v.updateMe, validate, updateMe);
router.post("/me/password/request", protect, passwordChangeLimiter, v.requestPasswordChange, validate, requestPasswordChange);
router.post("/me/password/resend", protect, resendOtpLimiter, v.resendPasswordChange, validate, resendPasswordChange);
router.patch("/me/password", protect, resetPasswordLimiter, v.confirmPasswordChange, validate, changePassword);
router.post("/me/delete/request", protect, passwordChangeLimiter, requestAccountDeletion);
router.post("/me/delete/resend", protect, resendOtpLimiter, v.resendAccountDeletion, validate, resendAccountDeletionOtp);
router.delete("/me", protect, resetPasswordLimiter, v.confirmAccountDeletion, validate, deleteMe);
router.get("/:id/public", optionalAuth, idParam("id"), validate, getPublicProfile);

export default router;
