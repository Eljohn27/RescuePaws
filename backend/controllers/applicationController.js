import { matchedData } from "express-validator";
import AdoptionPost from "../models/AdoptionPost.js";
import AdoptionApplication from "../models/AdoptionApplication.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import audit from "../utils/audit.js";
import { notify, notifyAdmins } from "../utils/notify.js";
import { getPaging } from "../utils/pagination.js";
import { forbid, isAdmin, isOwner } from "../utils/guards.js";
import { serializeApplication } from "../utils/serializers.js";

const POST_POPULATE = { path: "post", select: "petName animalType age breed photoUrl owner listingStatus", populate: { path: "owner", select: "name" } };

// @route   POST /api/adoptions/:id/applications
// @access  Private (adopter)
export const submitApplication = asyncHandler(async (req, res) => {
  const post = await AdoptionPost.findById(req.params.id);
  // Listings that an admin has not approved are not public, so nobody can apply to them.
  if (!post || post.moderationStatus !== "Approved") throw new ApiError(404, "Adoption listing not found");
  if (isOwner(post.owner, req.userId)) throw new ApiError(400, "You cannot apply to your own listing");
  if (post.listingStatus === "Adopted") throw new ApiError(409, "This pet has already been adopted");

  const data = matchedData(req, { locations: ["body"] });
  let application;
  try {
    application = await AdoptionApplication.create({ ...data, post: post._id, applicant: req.userId });
  } catch (err) {
    if (err.code === 11000) throw new ApiError(409, "You have already applied for this pet");
    throw err;
  }

  const info = { category: "Adoption", relatedId: application._id };
  // The request goes to the poster, who decides.
  notify(post.owner, { ...info, title: `New adoption request: ${post.petName}`, message: `${application.fullName} wants to adopt ${post.petName}. Open your requests to approve or decline.` });
  audit(req, "application.submit", { resource: "application", resourceId: application._id });
  res.status(201).json({ _id: application._id, status: application.status, message: "Application submitted" });
});

// @route   GET /api/adoptions/:id/applications
// @access  Private (owner of the listing, or admin)
export const getApplicationsForPost = asyncHandler(async (req, res) => {
  const post = await AdoptionPost.findById(req.params.id);
  if (!post) throw new ApiError(404, "Adoption listing not found");
  if (!isAdmin(req.user) && !isOwner(post.owner, req.userId)) throw forbid(req, "adoption", post._id);

  const applications = await AdoptionApplication.find({ post: post._id }).sort({ createdAt: -1 }).populate(POST_POPULATE);
  res.json(applications.map(serializeApplication));
});

// @route   GET /api/applications/mine
// @access  Private
export const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await AdoptionApplication.find({ applicant: req.userId }).sort({ createdAt: -1 }).limit(100).populate(POST_POPULATE);
  res.json(applications.map(serializeApplication));
});

// @route   GET /api/applications/received
// @desc    Adoption requests for the logged-in user's own listings (the poster's inbox)
// @access  Private
export const getReceivedApplications = asyncHandler(async (req, res) => {
  const mine = await AdoptionPost.find({ owner: req.userId }).select("_id");
  const applications = await AdoptionApplication.find({ post: { $in: mine.map((p) => p._id) } })
    .sort({ createdAt: -1 })
    .limit(200)
    .populate(POST_POPULATE);
  res.json(applications.map(serializeApplication));
});

// @route   GET /api/applications
// @desc    Every application, in the shape used by the admin AdoptionReviews page
// @access  Private (admin only)
export const getAllApplications = asyncHandler(async (req, res) => {
  const { q, page, limit, skip } = getPaging(req, 50);
  const filter = {};
  if (typeof q.status === "string") filter.status = q.status;

  const [applications, total] = await Promise.all([
    AdoptionApplication.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate(POST_POPULATE),
    AdoptionApplication.countDocuments(filter),
  ]);
  res.json({ applications: applications.map(serializeApplication), total, page, totalPages: Math.ceil(total / limit) });
});

// @route   PATCH /api/applications/:id/review
// @desc    The POSTER approves or declines a request for their listing (an admin may too).
//          Approving marks the pet "Adopted" automatically, which removes it from the browse page,
//          and declines every other request still waiting for that pet.
//          Body: { status: "Approved" | "Rejected", reviewNote? }
// @access  Private (listing owner or admin)
export const reviewApplication = asyncHandler(async (req, res) => {
  const application = await AdoptionApplication.findById(req.params.id).populate(POST_POPULATE);
  if (!application || !application.post) throw new ApiError(404, "Application not found");
  if (!isAdmin(req.user) && !isOwner(application.post.owner, req.userId)) throw forbid(req, "application", application._id);
  if (application.status !== "Needs Review") throw new ApiError(409, "This request has already been answered");
  if (isOwner(application.applicant, req.userId)) throw forbid(req, "application", application._id); // no self-approval

  const { status, reviewNote } = matchedData(req, { locations: ["body"] });
  const post = application.post;

  if (status === "Approved") {
    // Atomic: only one request can win a pet, even if two are approved at the same moment.
    const adopted = await AdoptionPost.updateOne(
      { _id: post._id, listingStatus: { $ne: "Adopted" } },
      { listingStatus: "Adopted", adoptedBy: application.applicant, adoptedAt: new Date() }
    );
    if (!adopted.modifiedCount) throw new ApiError(409, "This pet has already been adopted");
  }

  application.status = status;
  application.reviewedBy = req.userId;
  application.reviewedAt = new Date();
  if (reviewNote !== undefined) application.reviewNote = reviewNote;
  await application.save();

  notify(application.applicant, {
    category: "Adoption",
    title: `Adoption request ${status === "Approved" ? "approved" : "declined"}: ${post.petName}`,
    message:
      status === "Approved"
        ? `Great news! Your request to adopt ${post.petName} was approved.`
        : `Your request to adopt ${post.petName} was not approved this time.${application.reviewNote ? ` Note: ${application.reviewNote}` : ""}`,
    relatedId: application._id,
  });

  if (status === "Approved") {
    // Decline everyone else still waiting for this pet.
    const others = await AdoptionApplication.find({ post: post._id, status: "Needs Review", _id: { $ne: application._id } }).select("applicant");
    if (others.length) {
      await AdoptionApplication.updateMany(
        { _id: { $in: others.map((o) => o._id) } },
        { status: "Rejected", reviewedBy: req.userId, reviewedAt: new Date(), reviewNote: "This pet was adopted by another applicant" }
      );
      others.forEach((o) =>
        notify(o.applicant, {
          category: "Adoption",
          title: `${post.petName} was adopted`,
          message: `${post.petName} found a home with another applicant.`,
          relatedId: o._id,
        })
      );
    }
    notifyAdmins({ category: "Adoption", title: "Pet Adopted", message: `${post.petName} was adopted.`, relatedId: post._id });
  }
  audit(req, "application.review", { resource: "application", resourceId: application._id, meta: { status } });
  res.json(serializeApplication(application));
});

// @route   DELETE /api/applications/:id
// @desc    Withdraw an application (its applicant, while it is still under review) - or admin
// @access  Private
export const withdrawApplication = asyncHandler(async (req, res) => {
  const application = await AdoptionApplication.findById(req.params.id);
  if (!application) throw new ApiError(404, "Application not found");

  const own = isOwner(application.applicant, req.userId);
  if (!isAdmin(req.user) && !own) throw forbid(req, "application", application._id);
  if (!isAdmin(req.user) && application.status !== "Needs Review") {
    throw new ApiError(409, "Only applications that are still under review can be withdrawn");
  }
  await application.deleteOne();
  audit(req, "application.withdraw", { resource: "application", resourceId: application._id });
  res.json({ message: "Application withdrawn" });
});
