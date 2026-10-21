import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { matchedData } from "express-validator";
import User from "../models/User.js";
import Sighting from "../models/Sighting.js";
import AdoptionPost from "../models/AdoptionPost.js";
import AdoptionApplication from "../models/AdoptionApplication.js";
import RescueProof from "../models/RescueProof.js";
import Report from "../models/Report.js";
import Notification from "../models/Notification.js";
import RegistrationChallenge from "../models/RegistrationChallenge.js";
import PasswordChallenge from "../models/PasswordChallenge.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import audit from "../utils/audit.js";
import generateToken from "../utils/generateToken.js";
import { notify } from "../utils/notify.js";
import { sendOtpEmail } from "../utils/mailer.js";
import { OTP_TTL_MS, OTP_RESEND_COOLDOWN_MS, OTP_MAX_ATTEMPTS, makeOtp, hashOtp, otpMatches, maskEmail } from "../utils/otp.js";
import { serializeUser, serializePoster, serializeSighting, serializeAdoption } from "../utils/serializers.js";
import { isOwner } from "../utils/guards.js";
import env from "../config/env.js";
import removeDirectMessages from "../utils/removeDirectMessages.js";

// @route   PATCH /api/users/me
// @desc    Update own profile. Roles can only be adopter/reporter here; "admin" is preserved, never granted.
// @access  Private
export const updateMe = asyncHandler(async (req, res) => {
  const data = matchedData(req, { locations: ["body"] });
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, "User not found");

  for (const field of ["name", "phone", "location", "avatar"]) {
    if (data[field] !== undefined) user[field] = data[field];
  }
  if (data.roles) user.roles = [...(user.roles.includes("admin") ? ["admin"] : []), ...data.roles];

  await user.save();
  audit(req, "user.update.self", { resource: "user", resourceId: user._id });
  res.json(serializeUser(user));
});

// ---------------------------------------------------------------- change password (current password + emailed code)
const signChallenge = (id) => jwt.sign({ id: String(id), purpose: "password-change" }, env.jwtSecret, { algorithm: "HS256", expiresIn: "5m" });
const readChallenge = (token) => {
  try {
    const claims = jwt.verify(token, env.jwtSecret, { algorithms: ["HS256"] });
    if (claims.purpose !== "password-change") throw new Error("wrong purpose");
    return claims;
  } catch {
    throw new ApiError(400, "This verification session expired. Please start again.");
  }
};
const deliver = (email, otp) =>
  sendOtpEmail({ to: email, subject: "Confirm your RescuePaws password change", intro: "Use this code to confirm the change to your RescuePaws password.", otp });
// Wrong codes use 400 (not 401) so the frontend doesn't mistake them for an expired login session.
const loadChallenge = async (token, userId) => {
  const claims = readChallenge(token);
  const challenge = await PasswordChallenge.findById(claims.id).select("+otpHash +newPasswordHash");
  if (!challenge || challenge.purpose !== "change" || String(challenge.user) !== String(userId) || challenge.expiresAt <= new Date()) {
    throw new ApiError(400, "This code expired. Please start again to get a new one.");
  }
  return challenge;
};

// @route   POST /api/users/me/password/request
// @desc    Step 1. Checks the current password and the new one, then emails a 6-digit code.
// @access  Private
export const requestPasswordChange = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = matchedData(req, { locations: ["body"] });
  const user = await User.findById(req.userId).select("+password");
  if (!user) throw new ApiError(404, "User not found");

  if (!(await user.matchPassword(currentPassword))) {
    audit(req, "user.password.change", { resource: "user", resourceId: user._id, outcome: "failure" });
    throw new ApiError(400, "Current password is incorrect");
  }

  const otp = makeOtp();
  let challenge = await PasswordChallenge.findOne({ user: user._id, purpose: "change" });
  if (!challenge) challenge = new PasswordChallenge({ user: user._id, purpose: "change" });
  Object.assign(challenge, {
    newPasswordHash: await bcrypt.hash(newPassword, env.bcryptRounds),
    otpHash: hashOtp(otp),
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
    attempts: 0,
    lastSentAt: new Date(),
  });
  await challenge.save();
  try {
    await deliver(user.email, otp);
  } catch (error) {
    await challenge.deleteOne();
    throw error;
  }
  res.json({ challengeToken: signChallenge(challenge._id), email: maskEmail(user.email), resendAfterSeconds: OTP_RESEND_COOLDOWN_MS / 1000 });
});

// @route   POST /api/users/me/password/resend
// @access  Private
export const resendPasswordChange = asyncHandler(async (req, res) => {
  const { challengeToken } = matchedData(req, { locations: ["body"] });
  const challenge = await loadChallenge(challengeToken, req.userId);
  if (challenge.attempts >= OTP_MAX_ATTEMPTS) throw new ApiError(429, "Too many incorrect codes. Please start again.");
  const waitMs = OTP_RESEND_COOLDOWN_MS - (Date.now() - challenge.lastSentAt.getTime());
  if (waitMs > 0) throw new ApiError(429, `Please wait ${Math.ceil(waitMs / 1000)} seconds before requesting another code.`);

  const user = await User.findById(req.userId).select("email");
  const otp = makeOtp();
  Object.assign(challenge, { otpHash: hashOtp(otp), expiresAt: new Date(Date.now() + OTP_TTL_MS), attempts: 0, lastSentAt: new Date() });
  await challenge.save();
  await deliver(user.email, otp);
  res.json({ message: "A new code was sent. Your previous code no longer works.", challengeToken: signChallenge(challenge._id), email: maskEmail(user.email), resendAfterSeconds: OTP_RESEND_COOLDOWN_MS / 1000 });
});

// @route   PATCH /api/users/me/password
// @desc    Step 2. The emailed code applies the change. Other devices are signed out; this one gets a fresh token.
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { challengeToken, otp } = matchedData(req, { locations: ["body"] });
  const challenge = await loadChallenge(challengeToken, req.userId);
  if (challenge.attempts >= OTP_MAX_ATTEMPTS) throw new ApiError(429, "Too many incorrect codes. Please start again.");
  if (!otpMatches(otp, challenge.otpHash)) {
    challenge.attempts += 1;
    await challenge.save();
    throw new ApiError(400, "That code is incorrect. Check your email and try again.");
  }

  const user = await User.findById(req.userId).select("+password +tokenVersion");
  if (!user) throw new ApiError(404, "User not found");
  user.password = challenge.newPasswordHash;
  user.$locals.passwordAlreadyHashed = true;
  user.tokenVersion += 1;
  await user.save();
  await challenge.deleteOne();

  audit(req, "user.password.change", { resource: "user", resourceId: user._id });
  await notify(user._id, { category: "System", title: "Your password was changed", message: "Your password was changed with an emailed code. If this wasn't you, reset it right away." });
  res.json({ message: "Password updated", token: generateToken(user._id, user.tokenVersion) });
});

// ---------------------------------------------------------------- account deletion (email OTP + transactional cleanup)
const signDeleteChallenge = (id) => jwt.sign({ id: String(id), purpose: "account-delete" }, env.jwtSecret, { algorithm: "HS256", expiresIn: "5m" });
const readDeleteChallenge = (token) => {
  try {
    const claims = jwt.verify(token, env.jwtSecret, { algorithms: ["HS256"] });
    if (claims.purpose !== "account-delete") throw new Error("wrong purpose");
    return claims;
  } catch {
    throw new ApiError(400, "This verification session expired. Start the account deletion process again.");
  }
};
const loadDeleteChallenge = async (token, userId) => {
  const claims = readDeleteChallenge(token);
  const challenge = await PasswordChallenge.findById(claims.id).select("+otpHash");
  if (!challenge || challenge.purpose !== "delete" || String(challenge.user) !== String(userId) || challenge.expiresAt <= new Date()) {
    throw new ApiError(400, "This code expired. Start the account deletion process again.");
  }
  return challenge;
};
const deliverDeleteOtp = (email, otp) => sendOtpEmail({
  to: email,
  subject: "Confirm your RescuePaws account deletion",
  intro: "We received a request to permanently delete your RescuePaws account and its posts. Enter this code to confirm.",
  otp,
});

export const requestAccountDeletion = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select("email");
  if (!user) throw new ApiError(404, "User not found");

  let challenge = await PasswordChallenge.findOne({ user: user._id, purpose: "delete" }).select("+otpHash");
  if (challenge && challenge.expiresAt > new Date()) {
    const waitMs = OTP_RESEND_COOLDOWN_MS - (Date.now() - challenge.lastSentAt.getTime());
    if (waitMs > 0) throw new ApiError(429, `Please wait ${Math.ceil(waitMs / 1000)} seconds before requesting another code.`);
  }
  if (!challenge) challenge = new PasswordChallenge({ user: user._id, purpose: "delete" });

  const otp = makeOtp();
  Object.assign(challenge, { otpHash: hashOtp(otp), expiresAt: new Date(Date.now() + OTP_TTL_MS), attempts: 0, lastSentAt: new Date() });
  await challenge.save();
  try {
    await deliverDeleteOtp(user.email, otp);
  } catch (error) {
    await challenge.deleteOne();
    throw error;
  }
  res.json({ challengeToken: signDeleteChallenge(challenge._id), email: maskEmail(user.email), resendAfterSeconds: OTP_RESEND_COOLDOWN_MS / 1000 });
});

export const resendAccountDeletionOtp = asyncHandler(async (req, res) => {
  const { challengeToken } = matchedData(req, { locations: ["body"] });
  const challenge = await loadDeleteChallenge(challengeToken, req.userId);
  if (challenge.attempts >= OTP_MAX_ATTEMPTS) throw new ApiError(429, "Too many incorrect codes. Start the account deletion process again.");
  const waitMs = OTP_RESEND_COOLDOWN_MS - (Date.now() - challenge.lastSentAt.getTime());
  if (waitMs > 0) throw new ApiError(429, `Please wait ${Math.ceil(waitMs / 1000)} seconds before requesting another code.`);

  const user = await User.findById(req.userId).select("email");
  if (!user) throw new ApiError(404, "User not found");
  const otp = makeOtp();
  Object.assign(challenge, { otpHash: hashOtp(otp), expiresAt: new Date(Date.now() + OTP_TTL_MS), attempts: 0, lastSentAt: new Date() });
  await challenge.save();
  await deliverDeleteOtp(user.email, otp);
  res.json({ message: "A new code was sent. Your previous code no longer works.", challengeToken: signDeleteChallenge(challenge._id), email: maskEmail(user.email), resendAfterSeconds: OTP_RESEND_COOLDOWN_MS / 1000 });
});

export const deleteMe = asyncHandler(async (req, res) => {
  const { challengeToken, otp } = matchedData(req, { locations: ["body"] });
  const challenge = await loadDeleteChallenge(challengeToken, req.userId);
  if (challenge.attempts >= OTP_MAX_ATTEMPTS) throw new ApiError(429, "Too many incorrect codes. Start the account deletion process again.");
  if (!otpMatches(otp, challenge.otpHash)) {
    challenge.attempts += 1;
    await challenge.save();
    throw new ApiError(400, "That code is incorrect. Check your email and try again.");
  }

  const user = await User.findById(req.userId);
  if (!user) throw new ApiError(404, "User not found");
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const sightings = await Sighting.find({ reportedBy: user._id }).select("_id").session(session);
      const adoptions = await AdoptionPost.find({ owner: user._id }).select("_id").session(session);
      const sightingIds = sightings.map((item) => item._id);
      const adoptionIds = adoptions.map((item) => item._id);
      const applicationIds = (await AdoptionApplication.find({ $or: [{ applicant: user._id }, { post: { $in: adoptionIds } }] }).select("_id").session(session)).map((item) => item._id);
      const proofIds = (await RescueProof.find({ $or: [{ submittedBy: user._id }, { sighting: { $in: sightingIds } }] }).select("_id").session(session)).map((item) => item._id);
      const reportIds = (await Report.find({ $or: [
        { reporter: user._id },
        { targetType: "sighting", target: { $in: sightingIds } },
        { targetType: "adoption", target: { $in: adoptionIds } },
      ] }).select("_id").session(session)).map((item) => item._id);
      const relatedIds = [...sightingIds, ...adoptionIds, ...applicationIds, ...proofIds, ...reportIds];

      await AdoptionApplication.deleteMany({ _id: { $in: applicationIds } }, { session });
      await RescueProof.deleteMany({ _id: { $in: proofIds } }, { session });
      await Report.deleteMany({ _id: { $in: reportIds } }, { session });
      await Notification.deleteMany({ $or: [{ user: user._id }, { relatedId: { $in: relatedIds } }] }, { session });
      await removeDirectMessages(user._id, session);
      await PasswordChallenge.deleteMany({ user: user._id }, { session });
      await RegistrationChallenge.deleteMany({ email: user.email }, { session });
      await Sighting.updateMany({ likes: user._id }, { $pull: { likes: user._id } }, { session });
      await Sighting.deleteMany({ reportedBy: user._id }, { session });
      await AdoptionPost.deleteMany({ owner: user._id }, { session });
      await User.deleteOne({ _id: user._id }, { session });
    });
  } finally {
    await session.endSession();
  }

  audit(req, "user.account.delete", { actor: user._id, resource: "user", resourceId: user._id });
  res.json({ message: "Your account and posts have been deleted." });
});

// @route   GET /api/users/:id/public
// @desc    A poster's public profile: avatar, public name, member-since date and their live posts. No email / phone.
// @access  Public
export const getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("name avatar createdAt");
  if (!user) throw new ApiError(404, "Member not found");

  const livePost = { postStatus: "published", moderationStatus: "Approved" };
  const [sightings, fosters, rescued, adopted] = await Promise.all([
    Sighting.find({ reportedBy: user._id, ...livePost }).populate("reportedBy", "name avatar createdAt").sort({ createdAt: -1 }).limit(50),
    AdoptionPost.find({ owner: user._id, moderationStatus: "Approved", listingStatus: { $ne: "Adopted" } }).populate("owner", "name avatar createdAt").sort({ createdAt: -1 }).limit(50),
    Sighting.countDocuments({ reportedBy: user._id, moderationStatus: "Rescued" }),
    AdoptionPost.countDocuments({ owner: user._id, listingStatus: "Adopted" }),
  ]);

  res.json({
    user: serializePoster(user),
    isMe: !!req.user && isOwner(user, req.userId),
    stats: { livePosts: sightings.length + fosters.length, strayRescued: rescued, petsAdopted: adopted },
    sightings: sightings.map((s) => serializeSighting(s, req.user)),
    fosters: fosters.map((p) => serializeAdoption(p, req.user)),
  });
});
