import { matchedData } from "express-validator";
import Report from "../models/Report.js";
import Sighting from "../models/Sighting.js";
import AdoptionPost from "../models/AdoptionPost.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import audit from "../utils/audit.js";
import { notify, notifyAdmins } from "../utils/notify.js";
import { getPaging } from "../utils/pagination.js";
import { isOwner } from "../utils/guards.js";
import { publicName } from "../utils/serializers.js";

const modelFor = (type) => (type === "sighting" ? Sighting : AdoptionPost);
const ownerField = (type) => (type === "sighting" ? "reportedBy" : "owner");
const isLive = (type, post) =>
  type === "sighting"
    ? post.postStatus === "published" && post.moderationStatus === "Approved"
    : post.moderationStatus === "Approved" && post.listingStatus !== "Adopted";
const postLabel = (type, post) => (type === "sighting" ? `${post.animalType} sighting at ${post.location}` : `${post.petName} (foster post)`);

// @route   POST /api/reports
// @desc    A member reports someone else's live post. Admins are notified.
// @access  Private
export const createReport = asyncHandler(async (req, res) => {
  const { targetType, targetId, reason, details } = matchedData(req, { locations: ["body"] });
  const post = await modelFor(targetType).findById(targetId);
  if (!post || !isLive(targetType, post)) throw new ApiError(404, "This post is no longer available");
  if (isOwner(post[ownerField(targetType)], req.userId)) throw new ApiError(400, "You cannot report your own post");

  let report;
  try {
    report = await Report.create({ reporter: req.userId, targetType, target: post._id, reason, details: details || "" });
  } catch (err) {
    if (err.code === 11000) throw new ApiError(409, "You already reported this post. An admin will review it.");
    throw err;
  }

  await notifyAdmins({ category: "Reports", title: "Post reported", message: `${postLabel(targetType, post)} was reported: ${reason}.`, relatedId: report._id });
  audit(req, "report.create", { resource: "report", resourceId: report._id, meta: { targetType, reason } });
  res.status(201).json({ message: "Thanks for letting us know. An admin will review this post." });
});

// @route   GET /api/reports
// @desc    Admin queue (default: open reports) with a summary of the reported post and who posted it
// @access  Private (admin only)
export const getReports = asyncHandler(async (req, res) => {
  const { q, page, limit, skip } = getPaging(req, 50);
  const filter = { status: typeof q.status === "string" ? q.status : "Open" };
  const [reports, total] = await Promise.all([
    Report.find(filter).populate("reporter", "name email").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Report.countDocuments(filter),
  ]);

  const ids = (type) => reports.filter((r) => r.targetType === type).map((r) => r.target);
  const [sightings, fosters] = await Promise.all([
    Sighting.find({ _id: { $in: ids("sighting") } }).populate("reportedBy", "name email phone"),
    AdoptionPost.find({ _id: { $in: ids("adoption") } }).populate("owner", "name email phone"),
  ]);
  const byId = new Map([...sightings, ...fosters].map((d) => [String(d._id), d]));

  const items = reports.map((r) => {
    const post = byId.get(String(r.target));
    const who = post && (r.targetType === "sighting" ? post.reportedBy : post.owner);
    return {
      id: String(r._id),
      targetType: r.targetType,
      targetId: String(r.target),
      reason: r.reason,
      details: r.details,
      status: r.status,
      createdAt: r.createdAt,
      reportedBy: r.reporter ? { name: r.reporter.name, email: r.reporter.email } : null,
      post: post
        ? {
            title: r.targetType === "sighting" ? `${post.animalType} sighting` : post.petName,
            image: post.photoUrl || "",
            location: post.location,
            moderationStatus: post.moderationStatus,
            poster: who ? { name: who.name, publicName: publicName(who.name), email: who.email, phone: who.phone } : null,
          }
        : null,
    };
  });
  res.json({ reports: items, total, page, totalPages: Math.ceil(total / limit) });
});

// @route   PATCH /api/reports/:id/review
// @desc    Admin dismisses a report, or takes the post down (the poster is told the reason, the reporters are thanked)
//          Body: { action: "dismiss" | "takedown", reviewNote? }
// @access  Private (admin only)
export const reviewReport = asyncHandler(async (req, res) => {
  const { action, reviewNote } = matchedData(req, { locations: ["body"] });
  const report = await Report.findById(req.params.id);
  if (!report) throw new ApiError(404, "Report not found");
  if (report.status !== "Open") throw new ApiError(409, "This report was already reviewed");

  const post = await modelFor(report.targetType).findById(report.target);

  if (action === "dismiss") {
    report.status = "Dismissed";
    report.reviewedBy = req.userId;
    report.reviewedAt = new Date();
    await report.save();
    await notify(report.reporter, { category: "Reports", title: "Your report was reviewed", message: "We looked at the post you reported and found no violation. Thank you for helping keep RescuePaws safe.", relatedId: report._id });
    audit(req, "report.dismiss", { resource: "report", resourceId: report._id });
    return res.json({ message: "Report dismissed." });
  }

  // takedown
  if (post) {
    post.moderationStatus = "Rejected";
    post.reviewedBy = req.userId;
    post.reviewedAt = new Date();
    post.reviewNote = reviewNote;
    await post.save();
    await notify(post[ownerField(report.targetType)], {
      category: report.targetType === "sighting" ? "Sightings" : "Adoption",
      title: "Your post was taken down",
      message: `${postLabel(report.targetType, post)} was taken down after a report. Reason: ${reviewNote} You can edit the post and it will be reviewed again.`,
      relatedId: post._id,
    });
  }
  const open = await Report.find({ target: report.target, targetType: report.targetType, status: "Open" });
  await Report.updateMany({ _id: { $in: open.map((r) => r._id) } }, { status: "Actioned", reviewedBy: req.userId, reviewedAt: new Date(), reviewNote });
  await Promise.all(open.map((r) => notify(r.reporter, { category: "Reports", title: "Thanks for your report", message: "The post you reported was reviewed and taken down.", relatedId: r._id })));
  audit(req, "report.takedown", { resource: "report", resourceId: report._id, meta: { targetType: report.targetType } });
  res.json({ message: "Post taken down. The poster was notified." });
});
