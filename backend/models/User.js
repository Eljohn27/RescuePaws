import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import env from "../config/env.js";
import { ROLES } from "../utils/roles.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    phone: {
      type: String,
      required: true,
      match: [/^[0-9]{11}$/, "Phone number must be 11 digits, numbers only"],
    },
    // A person can hold several roles (e.g. adopter + reporter). "admin" is never self-assigned.
    roles: {
      type: [{ type: String, enum: ROLES }],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "Select at least one role (Adopting and/or Reporting Strays)",
      },
    },
    termsAccepted: {
      type: Boolean,
      required: true,
      validate: { validator: (v) => v === true, message: "You must agree to the terms to create an account" },
    },
    location: { type: String, trim: true, maxlength: 100, default: "" },
    avatar: { type: String, trim: true, maxlength: 2048, default: "" },
    // Stored ONLY as a bcrypt hash. select:false keeps it out of every query unless explicitly requested.
    password: { type: String, required: true, minlength: 8, select: false },

    // --- Session & account security ---
    // Bumped on logout (and can be bumped by an admin to force a user off).
    // Every JWT carries the tokenVersion that was current when it was issued;
    // `protect` compares it to the current value in the database, so a token
    // minted before a logout stops working immediately instead of staying
    // valid until it naturally expires.
    tokenVersion: { type: Number, default: 0, select: false },

    // Brute-force protection: counted on each failed login, reset on success.
    failedLoginAttempts: { type: Number, default: 0, select: false },
    // Set to a future timestamp once failedLoginAttempts crosses the threshold;
    // login is refused while lockUntil is in the future.
    lockUntil: { type: Date, default: null, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Hash the password whenever it is new or changed (bcrypt, cost 12). Controllers never hash it themselves.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, env.bcryptRounds);
});

userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

export default mongoose.model("User", userSchema);
