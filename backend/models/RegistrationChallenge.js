import mongoose from "mongoose";

const registrationChallengeSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, unique: true, maxlength: 254 },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true, select: false },
    roles: { type: [{ type: String, enum: ["adopter", "reporter"] }], required: true },
    termsAccepted: { type: Boolean, required: true },
    otpHash: { type: String, required: true, select: false },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    lastSentAt: { type: Date, required: true },
  },
  { timestamps: true }
);

registrationChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("RegistrationChallenge", registrationChallengeSchema);
