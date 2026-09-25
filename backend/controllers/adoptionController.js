import { matchedData } from "express-validator";
import AdoptionPost from "../models/AdoptionPost.js";
import AdoptionApplication from "../models/AdoptionApplication.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import audit from "../utils/audit.js";
import { notify, notifyAdmins } from "../utils/notify.js";
import { getPaging } from "../utils/pagination.js";
import { forbid, isAdmin, isOwner } from "../utils/guards.js";
import { serializeAdoption, STATUS_TAGS } from "../utils/serializers.js";

const KEY_TO_STATUS = Object.fromEntries(Object.entries(STATUS_TAGS).map(([status, t]) => [t.key, status]));
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Public = approved by an admin AND still looking for a home. Adopted pets leave the browse page (admins still see them).
const isPublic = (p) => p.moderationStatus === "Approved" && p.listingStatus !== "Adopted";

// @route   GET /api/adoptions
// @desc    Public adoption feed (array, AdoptionFeed.jsx shape) - APPROVED and not-yet-adopted listings only.
//          Filters: category=dog|cat, gender=male|female, status=ready,foster,...
//          Paging info is in the X-Total-Count / X-Page / X-Total-Pages headers.
// @access  Public
export const getAdoptions = asyncHandler(async (req, res) => {
  const { q, page, limit, skip } = getPaging(req);
  const filter = { moderationStatus: "Approved", listingStatus: { $ne: "Adopted" } };
  if (typeof q.category === "string") filter.animalType = cap(q.category);
  if (typeof q.gender === "string") filter.gender = cap(q.gender);
  if (typeof q.status === "string") {
    const wanted = q.status.split(",").map((k) => KEY_TO_STATUS[k]).filter((st) => st !== "Adopted");
    filter.listingStatus = { $in: wanted };
  }

  const [posts, total] = await Promise.all([
    AdoptionPost.find(filter).populate("owner", "name").sort({ createdAt: -1 }).skip(skip).limit(limit),
    AdoptionPost.countDocuments(filter),
  ]);
  res.set({ "X-Total-Count": String(total), "X-Page": String(page), "X-Total-Pages": String(Math.ceil(total / limit)) });
  res.json(posts.map((p) => serializeAdoption(p, req.user)));
});

// @route   GET /api/adoptions/mine
// @desc    The logged-in user's own listings in every state (pending / approved / rejected), with the admin's note
// @access  Private
export const getMyAdoptions = asyncHandler(async (req, res) => {
  const posts = await AdoptionPost.find({ owner: req.userId }).populate("owner", "name").sort({ createdAt: -1 }).limit(100);
  res.json(posts.map((p) => serializeAdoption(p, req.user)));
});

// @route   GET /api/adoptions/admin/all
// @desc    Every listing regardless of approval state, with the owner's contact details (admin review queue)
//          Filters: moderationStatus, listingStatus (e.g. Adopted), animalType
// @access  Private (admin only)
export const getAllAdoptionsAdmin = asyncHandler(async (req, res) => {
  const { q, page, limit, skip } = getPaging(req, 50);
  const filter = {};
  if (typeof q.moderationStatus === "string") filter.moderationStatus = q.moderationStatus;
  if (typeof q.listingStatus === "string") filter.listingStatus = q.listingStatus;
  if (typeof q.animalType === "string") filter.animalType = q.animalType;

  const [posts, total] = await Promise.all([
    AdoptionPost.find(filter).populate("owner", "name email phone").sort({ createdAt: -1 }).skip(skip).limit(limit),
    AdoptionPost.countDocuments(filter),
  ]);
  const adoptions = posts.map((p) => ({
    ...serializeAdoption(p, req.user),
    owner: p.owner ? { name: p.owner.name, email: p.owner.email, phone: p.owner.phone } : null,
  }));
  res.json({ adoptions, total, page, totalPages: Math.ceil(total / limit) });
});

// @route   GET /api/adoptions/:id
// @desc    One listing. Pending / rejected listings are visible only to their owner and admins.
// @access  Public (see above)
export const getAdoptionById = asyncHandler(async (req, res) => {
  const post = await AdoptionPost.findById(req.params.id).populate("owner", "name");
  const canSee = post && (isPublic(post) || (req.user && (isAdmin(req.user) || isOwner(post.owner, req.userId))));
  if (!canSee) throw new ApiError(404, "Adoption listing not found"); // 404 on purpose: don't reveal that hidden posts exist
  res.json(serializeAdoption(post, req.user));
});

// @route   POST /api/adoptions
// @desc    Post a pet for adoption. Regular users' listings wait for admin approval; an admin's own listing is approved at once.
// @access  Private (reporter, admin)
export const createAdoption = asyncHandler(async (req, res) => {
  const data = matchedData(req, { locations: ["body"] });
  const admin = isAdmin(req.user);

  const post = await AdoptionPost.create({
    ...data,
    owner: req.userId, // decided by the server, never by the client
    moderationStatus: admin ? "Approved" : "Pending for Approval",
    ...(admin ? { reviewedBy: req.userId, reviewedAt: new Date() } : {}),
  });
  await post.populate("owner", "name");

  if (!admin) {
    notifyAdmins({
      category: "Adoption",
      title: "Adoption Listing Needs Approval",
      message: `${post.petName} (${post.animalType.toLowerCase()}) in ${post.location} was submitted for approval.`,
      relatedId: post._id,
    });
  }
  audit(req, "adoption.create", { resource: "adoption", resourceId: post._id });
  res.status(201).json(serializeAdoption(post, req.user));
});

// @route   PUT /api/adoptions/:id
// @desc    Edit a listing. A regular user's edit sends it back to "Pending for Approval".
//          Only an admin can mark a listing "Adopted" (that happens when an adoption application is approved).
// @access  Private (owner or admin)
export const updateAdoption = asyncHandler(async (req, res) => {
  const post = await AdoptionPost.findById(req.params.id);
  if (!post) throw new ApiError(404, "Adoption listing not found");

  const admin = isAdmin(req.user);
  if (!admin && !isOwner(post.owner, req.userId)) throw forbid(req, "adoption", post._id);

  const data = matchedData(req, { locations: ["body"] });
  if (!admin) {
    if (post.listingStatus === "Adopted") throw new ApiError(409, "This pet has already been adopted, so the listing can no longer be edited");
    if (data.listingStatus === "Adopted") {
      audit(req, "access.denied", { resource: "adoption", resourceId: post._id, outcome: "denied", meta: { attempted: "set listingStatus Adopted" } });
      throw new ApiError(403, "Only an admin can mark a listing as adopted");
    }
  }

  const changed = Object.keys(data).length > 0;
  Object.assign(post, data);
  if (!admin && changed) {
    // The edited version must be approved again before it shows publicly.
    post.moderationStatus = "Pending for Approval";
    post.reviewedBy = undefined;
    post.reviewedAt = undefined;
    post.reviewNote = "";
  }
  await post.save();
  await post.populate("owner", "name");

  if (!admin && changed) {
    notifyAdmins({
      category: "Adoption",
      title: "Adoption Listing Needs Approval",
      message: `${post.petName} was edited and needs to be approved again.`,
      relatedId: post._id,
    });
  }
  audit(req, "adoption.update", { resource: "adoption", resourceId: post._id, meta: { fields: Object.keys(data) } });
  res.json(serializeAdoption(post, req.user));
});

// @route   PATCH /api/adoptions/:id/moderate
// @desc    Admin approves or rejects a listing.   Body: { moderationStatus: "Approved" | "Rejected", reviewNote? }
// @access  Private (admin only)
export const moderateAdoption = asyncHandler(async (req, res) => {
  const { moderationStatus, reviewNote } = matchedData(req, { locations: ["body"] });
  const post = await AdoptionPost.findById(req.params.id);
  if (!post) throw new ApiError(404, "Adoption listing not found");

  post.moderationStatus = moderationStatus;
  post.reviewedBy = req.userId;
  post.reviewedAt = new Date();
  post.reviewNote = reviewNote || "";
  await post.save();
  await post.populate("owner", "name");

  const approved = moderationStatus === "Approved";
  notify(post.owner, {
    category: "Adoption",
    title: `Your adoption listing was ${moderationStatus.toLowerCase()}: ${post.petName}`,
    message: approved
      ? `${post.petName} is now live in the adoption feed.`
      : `${post.petName} was not approved.${post.reviewNote ? ` Reason: ${post.reviewNote}` : ""} You can edit the listing and it will be reviewed again.`,
    relatedId: post._id,
  });
  audit(req, "adoption.moderate", { resource: "adoption", resourceId: post._id, meta: { moderationStatus } });
  res.json(serializeAdoption(post, req.user));
});

// @route   DELETE /api/adoptions/:id
// @access  Private (owner or admin)
export const deleteAdoption = asyncHandler(async (req, res) => {
  const post = await AdoptionPost.findById(req.params.id);
  if (!post) throw new ApiError(404, "Adoption listing not found");
  if (!isAdmin(req.user) && !isOwner(post.owner, req.userId)) throw forbid(req, "adoption", post._id);

  await AdoptionApplication.deleteMany({ post: post._id });
  await post.deleteOne();
  audit(req, "adoption.delete", { resource: "adoption", resourceId: post._id });
  res.json({ message: "Adoption listing deleted" });
});
