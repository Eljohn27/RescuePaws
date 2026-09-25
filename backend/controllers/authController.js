import bcrypt from "bcryptjs";
import { matchedData } from "express-validator";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import audit from "../utils/audit.js";
import generateToken from "../utils/generateToken.js";
import { serializeUser } from "../utils/serializers.js";
import env from "../config/env.js";

// Compared against when the email is unknown, so response time doesn't reveal which emails exist.
let dummyHash;
const getDummyHash = async () => (dummyHash = dummyHash || (await bcrypt.hash("not-a-real-password", env.bcryptRounds)));

// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  // matchedData() returns ONLY the fields that passed validation (mass-assignment protection):
  // anything extra in the request body, e.g. { "roles": ["admin"] }, never reaches the database.
  const { name, email, phone, password, roles, termsAccepted } = matchedData(req, { locations: ["body"] });

  if (await User.exists({ email })) throw new ApiError(409, "An account with this email already exists");

  const user = await User.create({ name, email, phone, password, roles, termsAccepted }); // password hashed by the model
  audit(req, "auth.register", { actor: user._id, resource: "user", resourceId: user._id });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    roles: user.roles,
    token: generateToken(user._id, user.tokenVersion),
  });
});

// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = matchedData(req, { locations: ["body"] });

  // .select("+password") because the schema hides it by default. sanitizeFilter = extra NoSQL-injection defence.
  const user = await User.findOne({ email })
    .select("+password +tokenVersion +failedLoginAttempts +lockUntil")
    .setOptions({ sanitizeFilter: true });

  // Account temporarily locked from too many recent failed attempts — refuse before even
  // checking the password, so a correct password can't be used to "test" a locked account.
  if (user && user.isLocked()) {
    audit(req, "auth.login.locked", { actor: user._id, resource: "user", outcome: "failure" });
    const minutes = Math.ceil((user.lockUntil - Date.now()) / 60000);
    throw new ApiError(423, `Account temporarily locked. Try again in ${minutes} minute(s).`);
  }

  const valid = await bcrypt.compare(password, user ? user.password : await getDummyHash());

  // Deliberately vague: never reveal whether the email or the password was wrong.
  if (!user || !valid) {
    if (user) {
      // Only real accounts accumulate lock state — an unknown email can't be used to lock
      // someone else's (nonexistent, from the attacker's view) account.
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= env.maxLoginAttempts) {
        user.lockUntil = new Date(Date.now() + env.lockoutMinutes * 60 * 1000);
      }
      await user.save();
    }
    audit(req, "auth.login.failure", { actor: user && user._id, resource: "user", outcome: "failure" });
    throw new ApiError(401, "Invalid email or password");
  }

  // Successful login clears any prior failed-attempt count / lock.
  if (user.failedLoginAttempts > 0 || user.lockUntil) {
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();
  }

  audit(req, "auth.login.success", { actor: user._id, resource: "user", resourceId: user._id });
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    roles: user.roles,
    token: generateToken(user._id, user.tokenVersion),
  });
});

// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, "User not found");
  res.json(serializeUser(user));
});

// @route   POST /api/auth/logout
// @desc    Invalidates the current token (and every other token issued before now) by bumping
//          tokenVersion, then records the event in the audit log. Because JWTs can't be individually
//          revoked, this logs the user out everywhere at once rather than just on this device.
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { $inc: { tokenVersion: 1 } });
  audit(req, "auth.logout", { resource: "user", resourceId: req.user.id });
  res.json({ message: "Logged out" });
});
