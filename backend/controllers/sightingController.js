import { matchedData } from "express-validator";
import Sighting from "../models/Sighting.js";
import RescueProof from "../models/RescueProof.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import audit from "../utils/audit.js";
import { notify, notifyAdmins } from "../utils/notify.js";
import { getPaging } from "../utils/pagination.js";
import { forbid, isAdmin, isOwner } from "../utils/guards.js";
import { serializeSighting } from "../utils/serializers.js";

// Only approved, published sightings are on the browse page. Once rescued, a sighting leaves it (admins still see it).
const VISIBLE = { postStatus: "published", moderationStatus: "Approved" };
const isPublic = (s) => s.postStatus === "published" && s.moderationStatus === "Approved";

// @route   POST /api/sightings
// @desc    Report a sighting. postStatus "draft" (Save Draft) or "published" (Publish Sighting Post)
// @access  Private (reporter, admin)
export const createSighting = asyncHandler(async (req, res) => {
  const data = matchedData(req, { locations: ["body"] }); // only validated fields
  const admin = isAdmin(req.user);

  const sighting = await Sighting.create({
    ...data,
    reportedBy: req.userId, // decided by the server, never by the client
    postStatus: data.postStatus === "draft" ? "draft" : "published",
    // Reports from regular users wait for moderation; an admin's own report is approved straight away.
    moderationStatus: admin ? "Approved" : "Pending for Approval",
  });

  if (sighting.postStatus === "published" && !admin) {
    notifyAdmins({
      category: "Sightings",
      title: "Sighting Moderation Required",
      message: `New ${sighting.animalType.toLowerCase()} report at ${sighting.location} needs approval.`,
      relatedId: sighting._id,
    });
  }
  audit(req, "sighting.create", { resource: "sighting", resourceId: sighting._id });
  res.status(201).json(sighting);
});

// @route   GET /api/sightings
// @desc    Public feed: published + moderated sightings, newest first. Returns an ARRAY (what Home.jsx expects);
//          paging info is in the X-Total-Count / X-Page / X-Total-Pages headers.
// @access  Public
export const getSightings = asyncHandler(async (req, res) => {
  const { q, page, limit, skip } = getPaging(req);
  const filter = { ...VISIBLE };
  if (typeof q.rescueStatus === "string") filter.rescueStatus = q.rescueStatus;
  if (typeof q.animalType === "string") filter.animalType = q.animalType;

  const [sightings, total] = await Promise.all([
    Sighting.find(filter).populate("reportedBy", "name").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Sighting.countDocuments(filter),
  ]);

  res.set({ "X-Total-Count": String(total), "X-Page": String(page), "X-Total-Pages": String(Math.ceil(total / limit)) });
  res.json(sightings.map((s) => serializeSighting(s, req.user)));
});

// @route   GET /api/sightings/mine
// @desc    Own sightings, including drafts and unreviewed ones
// @access  Private
export const getMySightings = asyncHandler(async (req, res) => {
  const sightings = await Sighting.find({ reportedBy: req.userId }).sort({ createdAt: -1 }).limit(100);
  res.json(sightings);
});

// @route   GET /api/sightings/:id
// @desc    One sighting. Drafts / unreviewed / rejected ones are visible only to their reporter and admins.
// @access  Public (see above)
export const getSightingById = asyncHandler(async (req, res) => {
  const sighting = await Sighting.findById(req.params.id).populate("reportedBy", "name");
  const canSee = sighting && (isPublic(sighting) || (req.user && (isOwner(sighting.reportedBy, req.userId) || isAdmin(req.user))));
  if (!canSee) throw new ApiError(404, "Sighting not found"); // 404 on purpose: don't reveal that hidden posts exist
  res.json(serializeSighting(sighting, req.user));
});

// @route   PUT /api/sightings/:id
// @desc    Update a sighting (reporter or admin) - also used to publish a saved draft
// @access  Private
export const updateSighting = asyncHandler(async (req, res) => {
  const sighting = await Sighting.findById(req.params.id);
  if (!sighting) throw new ApiError(404, "Sighting not found");

  const admin = isAdmin(req.user);
  if (!admin && !isOwner(sighting.reportedBy, req.userId)) throw forbid(req, "sighting", sighting._id);
  if (!admin && sighting.moderationStatus === "Rescued") throw new ApiError(409, "This stray was already rescued, so the report can no longer be edited");

  const data = matchedData(req, { locations: ["body"] });
  if (data.rescueStatus !== undefined && !admin) throw forbid(req, "sighting", sighting._id); // public badge: admins only

  const wasPublished = sighting.postStatus === "published";
  Object.assign(sighting, data);
  // A regular user's edit must be re-approved before it shows publicly again.
  if (!admin) sighting.moderationStatus = "Pending for Approval";
  await sighting.save();

  if (!admin && sighting.postStatus === "published" && !wasPublished) {
    notifyAdmins({
      category: "Sightings",
      title: "Sighting Moderation Required",
      message: `A ${sighting.animalType.toLowerCase()} report at ${sighting.location} was published and needs approval.`,
      relatedId: sighting._id,
    });
  }
  audit(req, "sighting.update", { resource: "sighting", resourceId: sighting._id, meta: { fields: Object.keys(data) } });
  res.json(sighting);
});

// @route   PATCH /api/sightings/:id/like
// @desc    Toggle a like from the logged-in user
// @access  Private
export const toggleLike = asyncHandler(async (req, res) => {
  const sighting = await Sighting.findById(req.params.id);
  if (!sighting || !isPublic(sighting)) throw new ApiError(404, "Sighting not found");

  const alreadyLiked = sighting.likes.some((id) => String(id) === req.userId);
  if (alreadyLiked) sighting.likes = sighting.likes.filter((id) => String(id) !== req.userId);
  else sighting.likes.push(req.userId);

  await sighting.save();
  res.json({ likeCount: sighting.likes.length, liked: !alreadyLiked });
});

// @route   GET /api/sightings/admin/all
// @desc    Every sighting regardless of moderation/publish status, for the admin dashboard
// @access  Private (admin only)
export const getAllSightingsAdmin = asyncHandler(async (req, res) => {
  const { q, page, limit, skip } = getPaging(req, 50);
  const filter = {};
  if (typeof q.moderationStatus === "string") filter.moderationStatus = q.moderationStatus;
  if (typeof q.animalType === "string") filter.animalType = q.animalType;

  const [sightings, total] = await Promise.all([
    Sighting.find(filter).populate("reportedBy", "name email phone").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Sighting.countDocuments(filter),
  ]);
  res.json({ sightings, total, page, totalPages: Math.ceil(total / limit) });
});

// @route   PATCH /api/sightings/:id/moderate
// @desc    Admin approves, rejects, or marks a sighting rescued.   Body: { moderationStatus }
// @access  Private (admin only)
export const moderateSighting = asyncHandler(async (req, res) => {
  const { moderationStatus } = matchedData(req, { locations: ["body"] });
  const sighting = await Sighting.findById(req.params.id);
  if (!sighting) throw new ApiError(404, "Sighting not found");

  sighting.moderationStatus = moderationStatus;
  // Keep the public badge roughly in sync with the decision.
  if (moderationStatus === "Rescued") sighting.rescueStatus = "Rescue Resolved";
  if (moderationStatus === "Approved" && sighting.rescueStatus === "Spotted") sighting.rescueStatus = "Needs Foster";
  await sighting.save();

  notify(sighting.reportedBy, {
    category: "Sightings",
    title: `Your sighting was ${moderationStatus.toLowerCase()}`,
    message: `Your report at ${sighting.location} is now "${moderationStatus}".`,
    relatedId: sighting._id,
  });
  audit(req, "sighting.moderate", { resource: "sighting", resourceId: sighting._id, meta: { moderationStatus } });
  res.json(sighting);
});

// @route   DELETE /api/sightings/:id
// @access  Private (reporter of that sighting, or admin)
export const deleteSighting = asyncHandler(async (req, res) => {
  const sighting = await Sighting.findById(req.params.id);
  if (!sighting) throw new ApiError(404, "Sighting not found");
  if (!isAdmin(req.user) && !isOwner(sighting.reportedBy, req.userId)) throw forbid(req, "sighting", sighting._id);

  await RescueProof.deleteMany({ sighting: sighting._id });
  await sighting.deleteOne();
  audit(req, "sighting.delete", { resource: "sighting", resourceId: sighting._id });
  res.json({ message: "Sighting deleted" });
});
