import { matchedData } from "express-validator";
import PostReport from "../models/PostReport.js";
import Sighting from "../models/Sighting.js";
import AdoptionPost from "../models/AdoptionPost.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import audit from "../utils/audit.js";

export const createPostReport = asyncHandler(async (req, res) => {
 const data = matchedData(req, { locations: ["body"] });
 const Model = data.postType === "sighting" ? Sighting : AdoptionPost;
 const post = await Model.findById(data.postId);
 if (!post) throw new ApiError(404, "The reported post could not be found");
 const ownerId = String(data.postType === "sighting" ? post.reportedBy : post.owner);
 if (ownerId === req.userId) throw new ApiError(400, "You cannot report your own post");
 const report = await PostReport.create({ reporter: req.userId, ...data });
 audit(req, "post.report.created", { resource: "postReport", resourceId: report._id, meta: { postType: data.postType, postId: data.postId } });
 res.status(201).json({ message: "Report sent to the admin team", reportId: report._id });
});

export const listPostReports = asyncHandler(async (req, res) => {
 const reports = await PostReport.find().populate("reporter", "name email").sort({ createdAt: -1 }).limit(300);
 res.json(reports);
});

export const updatePostReport = asyncHandler(async (req, res) => {
 const data = matchedData(req, { locations: ["body"] });
 const report = await PostReport.findById(req.params.id);
 if (!report) throw new ApiError(404, "Report not found");
 report.status = data.status;
 if (data.adminNote !== undefined) report.adminNote = data.adminNote;
 await report.save();
 audit(req, "post.report.updated", { resource: "postReport", resourceId: report._id, meta: { status: report.status } });
 res.json(report);
});
