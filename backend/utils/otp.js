// One-time-code helpers shared by sign-up, password reset and password change.
import crypto from "node:crypto";
import env from "../config/env.js";

export const OTP_TTL_MS = 5 * 60 * 1000;
export const OTP_RESEND_COOLDOWN_MS = 30 * 1000;
export const OTP_MAX_ATTEMPTS = 5;

export const makeOtp = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
export const hashOtp = (otp) => crypto.createHmac("sha256", env.jwtSecret).update(String(otp)).digest("hex");
export const otpMatches = (otp, storedHash) => {
  const a = Buffer.from(hashOtp(otp));
  const b = Buffer.from(String(storedHash || ""));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};
export const maskEmail = (email = "") => email.replace(/(^.).*(@.*$)/, "$1****$2");
