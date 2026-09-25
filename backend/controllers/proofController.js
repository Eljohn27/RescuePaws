import { matchedData } from "express-validator";
import Sighting from "../models/Sighting.js";
import RescueProof from "../models/RescueProof.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import audit from "../utils/audit.js";
import { notify, notifyAdmins } from "../utils/notify.js";
import { getPaging } from "../utils/pagination.js";
import { isOwner } from "../utils/guards.js";
import { serializeProof } from "../utils/serializers.js";

const SIGHTING_POPULATE = { path: "sighting", select: "animalType location photoUrl moderationStatus reportedBy" };

// @route   POST /api/sightings/:id/proofs
// @desc    "I got this stray" - send a photo + short message. It goes to the admin, who marks the sighting Rescued.
// @access  Private (adopter)
export const submitProof = asyncHandler(async (req, res) => {
  const sighting = await Sighting.findById(req.params.id);
  const open = sighting && sighting.postStatus === "published" && sighting.moderationStatus === "Approved";
  if (!open) throw new ApiError(404, "Sighting not found");
  if (isOwner(sighting.reportedBy, req.userId)) throw new ApiError(400, "You cannot send proof for your own report");

  const data = matchedData(req, { locations: ["body"] });
  let proof;
  try {
    proof = await RescueProof.create({ ...data, sighting: sighting._id, submittedBy: req.userId });
  } catch (err) {
    if (err.code === 11000) throw new ApiError(409, "You already have a proof waiting for review for this stray");
    throw err;
  }

  notifyAdmins({
    category: "Sightings",
    title: "Rescue Proof Needs Review",
    message: `Someone sent proof for the ${sighting.animalType.toLowerCase()} at ${sighting.location}.`,
    relatedId: proof._id,
  });
  audit(req, "proof.submit", { resource: "proof", resourceId: proof._id });
  res.status(201).json({ _id: proof._id, status: proof.status, message: "Proof sent to the admin for review" });
});

// @route   GET /api/proofs/mine
// @access  Private
export const getMyProofs = asyncHandler(async (req, res) => {
  const proofs = await RescueProof.find({ submittedBy: req.userId }).sort({ createdAt: -1 }).limit(100).populate(SIGHTING_POPULATE);
  res.json(proofs.map((p) => serializeProof(p)));
});

// @route   GET /api/proofs
// @desc    All proofs for the admin review page. Filter: status
// @access  Private (admin only)
export const getAllProofs = asyncHandler(async (req, res) => {
  const { q, page, limit, skip } = getPaging(req, 50);
  const filter = {};
  if (typeof q.status === "string") filter.status = q.status;

  const [proofs, total] = await Promise.all([
    RescueProof.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate(SIGHTING_POPULATE).populate("submittedBy", "name email phone"),
    RescueProof.countDocuments(filter),
  ]);
  res.json({ proofs: proofs.map((p) => serializeProof(p, { withContact: true })), total, page, totalPages: Math.ceil(total / limit) });
});

// @route   PATCH /api/proofs/:id/review
// @desc    Admin approves (sighting becomes "Rescued" and leaves the browse page) or rejects.  Body: { status, reviewNote? }
// @access  Private (admin only)
export const reviewProof = asyncHandler(async (req, res) => {
  const proof = await RescueProof.findById(req.params.id).populate(SIGHTING_POPULATE).populate("submittedBy", "name email phone");
  if (!proof || !proof.sighting) throw new ApiError(404, "Proof not found");
  if (proof.status !== "Needs Review") throw new ApiError(409, "This proof has already been reviewed");

  const { status, reviewNote } = matchedData(req, { locations: ["body"] });
  const sighting = proof.sighting;

  if (status === "Approved") {
    // Atomic: only one proof can close a sighting.
    const closed = await Sighting.updateOne(
      { _id: sighting._id, moderationStatus: { $ne: "Rescued" } },
      { moderationStatus: "Rescued", rescueStatus: "Rescue Resolved" }
    );
    if (!closed.modifiedCount) throw new ApiError(409, "This sighting is already marked as rescued");
  }

  proof.status = status;
  proof.reviewedBy = req.userId;
  proof.reviewedAt = new Date();
  proof.reviewNote = reviewNote || "";
  await proof.save();

  const place = sighting.location;
  notify(proof.submittedBy, {
    category: "Sightings",
    title: `Your rescue proof was ${status.toLowerCase()}`,
    message:
      status === "Approved"
        ? `Thank you! The stray at ${place} is now marked as rescued.`
        : `Your proof for the stray at ${place} was not approved.${proof.reviewNote ? ` Reason: ${proof.reviewNote}` : ""}`,
    relatedId: proof._id,
  });

  if (status === "Approved") {
    // Tell the original reporter, and close every other proof still waiting for this sighting.
    notify(sighting.reportedBy, {
      category: "Sightings",
      title: "Your sighting was rescued",
      message: `Good news! The stray you reported at ${place} has been rescued.`,
      relatedId: sighting._id,
    });
    const others = await RescueProof.find({ sighting: sighting._id, status: "Needs Review", _id: { $ne: proof._id } }).select("submittedBy");
    if (others.length) {
      await RescueProof.updateMany(
        { _id: { $in: others.map((o) => o._id) } },
        { status: "Rejected", reviewedBy: req.userId, reviewedAt: new Date(), reviewNote: "This stray was already rescued" }
      );
      others.forEach((o) =>
        notify(o.submittedBy, {
          category: "Sightings",
          title: "Rescue proof not needed",
          message: `The stray at ${place} was already marked as rescued.`,
          relatedId: sighting._id,
        })
      );
    }
  }
  audit(req, "proof.review", { resource: "proof", resourceId: proof._id, meta: { status } });
  res.json(serializeProof(proof, { withContact: true }));
});
