import { matchedData } from "express-validator";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import audit from "../utils/audit.js";
import { serializeUser } from "../utils/serializers.js";

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

// @route   PATCH /api/users/me/password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = matchedData(req, { locations: ["body"] });
  const user = await User.findById(req.user.id).select("+password");
  if (!user) throw new ApiError(404, "User not found");

  if (!(await user.matchPassword(currentPassword))) {
    audit(req, "user.password.change", { resource: "user", resourceId: user._id, outcome: "failure" });
    // 400 (not 401) so the frontend doesn't mistake it for an expired session
    throw new ApiError(400, "Current password is incorrect");
  }
  user.password = newPassword; // re-hashed by the pre-save hook
  await user.save();
  audit(req, "user.password.change", { resource: "user", resourceId: user._id });
  res.json({ message: "Password updated" });
});
