import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { matchedData } from "express-validator";
import User from "../models/User.js";
import RegistrationChallenge from "../models/RegistrationChallenge.js";
import PasswordChallenge from "../models/PasswordChallenge.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import audit from "../utils/audit.js";
import generateToken from "../utils/generateToken.js";
import { serializeUser } from "../utils/serializers.js";
import { notify } from "../utils/notify.js";
import { sendOtpEmail } from "../utils/mailer.js";
import { OTP_TTL_MS, OTP_RESEND_COOLDOWN_MS, OTP_MAX_ATTEMPTS, makeOtp, hashOtp, otpMatches, maskEmail } from "../utils/otp.js";
import env from "../config/env.js";

// Compared against when the email is unknown, so response time doesn't reveal which emails exist.
let dummyHash;
const getDummyHash = async () => (dummyHash = dummyHash || (await bcrypt.hash("not-a-real-password", env.bcryptRounds)));

const signChallenge = (purpose, id) => jwt.sign({ id: String(id), purpose }, env.jwtSecret, { algorithm: "HS256", expiresIn: "5m" });
const readChallenge = (token, purpose, expiredMessage, status = 400) => {
  try {
    const claims = jwt.verify(token, env.jwtSecret, { algorithms: ["HS256"] });
    if (claims.purpose !== purpose) throw new Error("wrong purpose");
    return claims;
  } catch {
    throw new ApiError(status, expiredMessage);
  }
};
const cooldownLeft = (lastSentAt) => (lastSentAt ? OTP_RESEND_COOLDOWN_MS - (Date.now() - lastSentAt.getTime()) : 0);

// ---------------------------------------------------------------- sign-up (email code)
const makeRegistrationChallenge = (pending) => signChallenge("registration-email", pending._id);

const deliverRegistrationOtp = (email, otp) =>
  sendOtpEmail({ to: email, subject: "Verify your RescuePaws account", intro: "Use this code to verify your email and finish creating your RescuePaws account.", otp });

// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  // matchedData() returns ONLY the fields that passed validation (mass-assignment protection).
  const { name, email, phone, password, roles, termsAccepted } = matchedData(req, { locations: ["body"] });

  if (await User.exists({ email })) throw new ApiError(409, "An account with this email already exists");

  const now = new Date();
  const otp = makeOtp();
  const passwordHash = await bcrypt.hash(password, env.bcryptRounds);
  let pending = await RegistrationChallenge.findOne({ email });
  if (!pending) pending = new RegistrationChallenge({ email });
  Object.assign(pending, {
    name,
    phone,
    passwordHash,
    roles,
    termsAccepted,
    otpHash: hashOtp(otp),
    expiresAt: new Date(now.getTime() + OTP_TTL_MS),
    attempts: 0,
    lastSentAt: now,
  });
  await pending.save();
  try {
    await deliverRegistrationOtp(email, otp);
  } catch (error) {
    await pending.deleteOne();
    throw error;
  }

  audit(req, "auth.registration.otp_sent", { resource: "registration", resourceId: pending._id });
  res.status(200).json({ verificationRequired: true, challengeToken: makeRegistrationChallenge(pending), email: maskEmail(email), resendAfterSeconds: OTP_RESEND_COOLDOWN_MS / 1000 });
});

export const resendRegistrationOtp = asyncHandler(async (req, res) => {
  const { challengeToken } = matchedData(req, { locations: ["body"] });
  const challenge = readChallenge(challengeToken, "registration-email", "This sign-up verification session expired. Please register again.", 401);

  const pending = await RegistrationChallenge.findById(challenge.id).select("+passwordHash +otpHash");
  if (!pending || !pending.otpHash || pending.expiresAt <= new Date()) {
    throw new ApiError(401, "This sign-up verification session expired. Please register again.");
  }
  if (pending.attempts >= OTP_MAX_ATTEMPTS) throw new ApiError(429, "Too many incorrect codes. Please register again.");
  const waitMs = cooldownLeft(pending.lastSentAt);
  if (waitMs > 0) throw new ApiError(429, `Please wait ${Math.ceil(waitMs / 1000)} seconds before requesting another code.`);

  const otp = makeOtp();
  pending.otpHash = hashOtp(otp);
  pending.expiresAt = new Date(Date.now() + OTP_TTL_MS);
  pending.attempts = 0;
  pending.lastSentAt = new Date();
  await pending.save();
  try {
    await deliverRegistrationOtp(pending.email, otp);
  } catch (error) {
    await pending.deleteOne();
    throw error;
  }
  res.json({ message: "A new verification code was sent. Your previous code no longer works.", challengeToken: makeRegistrationChallenge(pending), email: maskEmail(pending.email), resendAfterSeconds: OTP_RESEND_COOLDOWN_MS / 1000 });
});

export const verifyRegistrationOtp = asyncHandler(async (req, res) => {
  const { challengeToken, otp } = matchedData(req, { locations: ["body"] });
  const challenge = readChallenge(challengeToken, "registration-email", "This sign-up verification session expired. Please register again.", 401);

  const pending = await RegistrationChallenge.findById(challenge.id).select("+passwordHash +otpHash");
  if (!pending || !pending.otpHash || pending.expiresAt <= new Date()) {
    throw new ApiError(401, "This verification code expired. Please register again.");
  }
  if (pending.attempts >= OTP_MAX_ATTEMPTS) throw new ApiError(429, "Too many incorrect codes. Please register again.");
  if (!otpMatches(otp, pending.otpHash)) {
    pending.attempts += 1;
    await pending.save();
    throw new ApiError(401, "That code is incorrect. Check your email and try again.");
  }
  if (await User.exists({ email: pending.email })) {
    await pending.deleteOne();
    throw new ApiError(409, "An account with this email already exists");
  }

  const user = new User({
    name: pending.name,
    email: pending.email,
    phone: pending.phone,
    password: pending.passwordHash,
    roles: pending.roles,
    termsAccepted: pending.termsAccepted,
  });
  user.$locals.passwordAlreadyHashed = true;
  await user.save();
  await pending.deleteOne();
  audit(req, "auth.register", { actor: user._id, resource: "user", resourceId: user._id });
  res.status(201).json({ _id: user._id, name: user.name, email: user.email, roles: user.roles, message: "Email verified. Your account has been created." });
});

// ---------------------------------------------------------------- sign-in (password only)
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = matchedData(req, { locations: ["body"] });

  // .select("+password") because the schema hides it by default. sanitizeFilter = extra NoSQL-injection defence.
  const user = await User.findOne({ email })
    .select("+password +tokenVersion +failedLoginAttempts +lockUntil")
    .setOptions({ sanitizeFilter: true });

  // Account temporarily locked from too many recent failed attempts - refuse before even checking the password.
  if (user && user.isLocked()) {
    audit(req, "auth.login.locked", { actor: user._id, resource: "user", outcome: "failure" });
    const minutes = Math.ceil((user.lockUntil - Date.now()) / 60000);
    throw new ApiError(423, `Account temporarily locked. Try again in ${minutes} minute(s).`);
  }

  const valid = await bcrypt.compare(password, user ? user.password : await getDummyHash());

  // Deliberately vague: never reveal whether the email or the password was wrong.
  if (!user || !valid) {
    if (user) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= env.maxLoginAttempts) user.lockUntil = new Date(Date.now() + env.lockoutMinutes * 60 * 1000);
      await user.save();
    }
    audit(req, "auth.login.failure", { actor: user && user._id, resource: "user", outcome: "failure" });
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.failedLoginAttempts > 0 || user.lockUntil) {
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();
  }

  audit(req, "auth.login.success", { actor: user._id, resource: "user", resourceId: user._id });
  res.json({ _id: user._id, name: user.name, email: user.email, roles: user.roles, avatar: user.avatar || "", token: generateToken(user._id, user.tokenVersion) });
});

// ---------------------------------------------------------------- forgot password (email code)
const deliverResetOtp = (email, otp) =>
  sendOtpEmail({ to: email, subject: "Reset your RescuePaws password", intro: "Use this code to reset your RescuePaws password.", otp });

// @route   POST /api/auth/forgot-password
// @desc    Step 1. Same answer whether or not the email has an account, so it can't be used to look accounts up.
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = matchedData(req, { locations: ["body"] });
  const user = await User.findOne({ email }).setOptions({ sanitizeFilter: true });
  let challengeId = new mongoose.Types.ObjectId(); // placeholder for unknown emails

  if (user) {
    let challenge = await PasswordChallenge.findOne({ user: user._id, purpose: "reset" }).select("+otpHash");
    if (!challenge || cooldownLeft(challenge.lastSentAt) <= 0 || challenge.expiresAt <= new Date()) {
      const otp = makeOtp();
      if (!challenge) challenge = new PasswordChallenge({ user: user._id, purpose: "reset" });
      Object.assign(challenge, { otpHash: hashOtp(otp), expiresAt: new Date(Date.now() + OTP_TTL_MS), attempts: 0, lastSentAt: new Date() });
      await challenge.save();
      try {
        await deliverResetOtp(user.email, otp);
      } catch (error) {
        await challenge.deleteOne();
        throw error;
      }
      audit(req, "auth.password.reset_otp_sent", { actor: user._id, resource: "user", resourceId: user._id });
    }
    challengeId = challenge._id;
  }

  res.json({ challengeToken: signChallenge("password-reset", challengeId), email: maskEmail(email), resendAfterSeconds: OTP_RESEND_COOLDOWN_MS / 1000 });
});

// @route   POST /api/auth/resend-reset-otp
// @access  Public (needs the challenge token from step 1)
export const resendResetOtp = asyncHandler(async (req, res) => {
  const { challengeToken } = matchedData(req, { locations: ["body"] });
  const claims = readChallenge(challengeToken, "password-reset", "This reset session expired. Please start again.");
  const challenge = await PasswordChallenge.findById(claims.id).select("+otpHash").populate("user", "email");
  if (!challenge || challenge.purpose !== "reset" || !challenge.user) throw new ApiError(400, "This reset session expired. Please start again.");
  if (challenge.attempts >= OTP_MAX_ATTEMPTS) throw new ApiError(429, "Too many incorrect codes. Please start again.");
  const waitMs = cooldownLeft(challenge.lastSentAt);
  if (waitMs > 0) throw new ApiError(429, `Please wait ${Math.ceil(waitMs / 1000)} seconds before requesting another code.`);

  const otp = makeOtp();
  Object.assign(challenge, { otpHash: hashOtp(otp), expiresAt: new Date(Date.now() + OTP_TTL_MS), attempts: 0, lastSentAt: new Date() });
  await challenge.save();
  await deliverResetOtp(challenge.user.email, otp);
  res.json({ message: "A new code was sent. Your previous code no longer works.", challengeToken: signChallenge("password-reset", challenge._id), email: maskEmail(challenge.user.email), resendAfterSeconds: OTP_RESEND_COOLDOWN_MS / 1000 });
});

// @route   POST /api/auth/reset-password
// @desc    Step 2. The emailed code confirms the new password. Every existing session is signed out.
// @access  Public (needs the challenge token from step 1)
export const resetPassword = asyncHandler(async (req, res) => {
  const { challengeToken, otp, newPassword } = matchedData(req, { locations: ["body"] });
  const claims = readChallenge(challengeToken, "password-reset", "This reset session expired. Please start again.");
  const challenge = await PasswordChallenge.findById(claims.id).select("+otpHash");
  if (!challenge || challenge.purpose !== "reset" || challenge.expiresAt <= new Date()) throw new ApiError(400, "This code expired. Please start again to get a new one.");
  if (challenge.attempts >= OTP_MAX_ATTEMPTS) throw new ApiError(429, "Too many incorrect codes. Please start again.");
  if (!otpMatches(otp, challenge.otpHash)) {
    challenge.attempts += 1;
    await challenge.save();
    throw new ApiError(400, "That code is incorrect. Check your email and try again.");
  }

  const user = await User.findById(challenge.user).select("+password +tokenVersion +failedLoginAttempts +lockUntil");
  if (!user) {
    await challenge.deleteOne();
    throw new ApiError(400, "This reset session expired. Please start again.");
  }
  if (await bcrypt.compare(newPassword, user.password)) throw new ApiError(400, "New password must be different from your current password.");

  user.password = newPassword; // hashed by the pre-save hook
  user.tokenVersion += 1; // signs out every device
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  await user.save();
  await challenge.deleteOne();
  audit(req, "auth.password.reset", { actor: user._id, resource: "user", resourceId: user._id });
  await notify(user._id, { category: "System", title: "Your password was changed", message: "Your password was reset with an emailed code. If this wasn't you, reset it again right away." });
  res.json({ message: "Password updated. You can now sign in with your new password." });
});

// ---------------------------------------------------------------- session
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, "User not found");
  res.json(serializeUser(user));
});

// @route   POST /api/auth/logout
// @desc    Invalidates the current token (and every other token issued before now) by bumping tokenVersion.
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { $inc: { tokenVersion: 1 } });
  audit(req, "auth.logout", { resource: "user", resourceId: req.user.id });
  res.json({ message: "Logged out" });
});
