import mongoose from "mongoose";

// A pending password reset ("forgot password") or password change that is waiting for the emailed 6-digit code.
const passwordChallengeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    purpose: { type: String, enum: ["reset", "change", "delete"], required: true },
    newPasswordHash: { type: String, select: false }, // only used by "change" (the new password is hashed up front)
    otpHash: { type: String, required: true, select: false },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    lastSentAt: { type: Date, required: true },
  },
  { timestamps: true }
);

passwordChallengeSchema.index({ user: 1, purpose: 1 }, { unique: true });
passwordChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("PasswordChallenge", passwordChallengeSchema);
