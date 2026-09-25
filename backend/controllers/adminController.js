import { matchedData } from "express-validator";
import User from "../models/User.js";
import Sighting from "../models/Sighting.js";
import AdoptionPost from "../models/AdoptionPost.js";
import AdoptionApplication from "../models/AdoptionApplication.js";
import RescueProof from "../models/RescueProof.js";
import Notification from "../models/Notification.js";
import AuditLog from "../models/AuditLog.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import audit from "../utils/audit.js";
import { getPaging } from "../utils/pagination.js";
import { serializeUser } from "../utils/serializers.js";

const toMap = (rows) => Object.fromEntries(rows.map((r) => [r._id, r.count]));
const countBy = (Model, field) => Model.aggregate([{ $group: { _id: `$${field}`, count: { $sum: 1 } } }]);

// @route   GET /api/admin/stats
// @access  Private (admin only)
export const getStats = asyncHandler(async (req, res) => {
  const [users, sightings, adoptionPosts, applications, foster, onBrowseFosters, adopted, proofs] = await Promise.all([
    User.countDocuments(),
    countBy(Sighting, "moderationStatus"),
    countBy(AdoptionPost, "moderationStatus"),
    countBy(AdoptionApplication, "status"),
    AdoptionPost.countDocuments(),
    AdoptionPost.countDocuments({ moderationStatus: "Approved", listingStatus: { $ne: "Adopted" } }),
    AdoptionPost.countDocuments({ listingStatus: "Adopted" }),
    countBy(RescueProof, "status"),
  ]);
  const bySighting = toMap(sightings);
  const byPost = toMap(adoptionPosts);
  const sum = (m) => Object.values(m).reduce((a, b) => a + b, 0);
  res.json({
    // The five counters on the admin dashboard
    counters: {
      users,
      sightings: sum(bySighting),
      fosters: foster,
      rescued: bySighting["Rescued"] || 0,
      onBrowse: (bySighting["Approved"] || 0) + onBrowseFosters, // approved sightings + approved fosters still open
    },
    adopted,
    users,
    sightings: { total: sum(bySighting), byModeration: bySighting },
    adoptionPosts: { total: sum(byPost), byModeration: byPost },
    applications: toMap(applications),
    proofs: toMap(proofs),
  });
});

// @route   GET /api/admin/users
// @access  Private (admin only)
export const listUsers = asyncHandler(async (req, res) => {
  const { q, page, limit, skip } = getPaging(req, 50);
  const filter = typeof q.role === "string" ? { roles: q.role } : {};
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  res.json({ users: users.map(serializeUser), total, page, totalPages: Math.ceil(total / limit) });
});

// @route   PATCH /api/admin/users/:id
// @desc    Edit a user's name and/or phone.  Body: { name?, phone? }
// @access  Private (admin only)
export const updateUser = asyncHandler(async (req, res) => {
  const data = matchedData(req, { locations: ["body"] });
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  for (const field of ["name", "phone"]) {
    if (data[field] !== undefined) user[field] = data[field];
  }
  await user.save();
  audit(req, "user.update.admin", { resource: "user", resourceId: user._id, meta: { fields: Object.keys(data) } });
  res.json(serializeUser(user));
});

// @route   PATCH /api/admin/users/:id/roles
// @desc    Set a user's roles (the only way to grant "admin" besides the seed script).  Body: { roles: [...] }
// @access  Private (admin only)
export const setUserRoles = asyncHandler(async (req, res) => {
  if (req.params.id === req.userId) throw new ApiError(400, "You cannot change your own roles");
  const { roles } = matchedData(req, { locations: ["body"] });

  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  const from = user.roles;
  user.roles = [...new Set(roles)];
  await user.save();

  audit(req, "user.roles.change", { resource: "user", resourceId: user._id, meta: { from, to: user.roles } });
  res.json(serializeUser(user));
});

// @route   DELETE /api/admin/users/:id
// @access  Private (admin only)
export const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.userId) throw new ApiError(400, "You cannot delete your own account here");
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  // Remove the person's private data; their public posts stay (shown as "Deleted user").
  await Promise.all([
    Notification.deleteMany({ user: user._id }),
    AdoptionApplication.deleteMany({ applicant: user._id }),
    RescueProof.deleteMany({ submittedBy: user._id }),
  ]);
  audit(req, "user.delete", { resource: "user", resourceId: user._id });
  res.json({ message: "User deleted" });
});

// @route   GET /api/admin/audit-logs
// @access  Private (admin only)
export const getAuditLogs = asyncHandler(async (req, res) => {
  const { q, page, limit, skip } = getPaging(req, 50);
  const filter = typeof q.outcome === "string" ? { outcome: q.outcome } : {};
  const [logs, total] = await Promise.all([
    AuditLog.find(filter).populate("actor", "name email roles").sort({ createdAt: -1 }).skip(skip).limit(limit),
    AuditLog.countDocuments(filter),
  ]);
  res.json({ logs, total, page, totalPages: Math.ceil(total / limit) });
});
