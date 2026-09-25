import mongoose from "mongoose";

const s = (max, extra = {}) => ({ type: String, trim: true, maxlength: max, default: "", ...extra });

const applicationSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "AdoptionPost", required: true, index: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // Same field names as the adoption request form on the website
    fullName: s(60, { required: true }),
    phone: s(20, { required: true }),
    email: s(254, { required: true, lowercase: true }),
    address: s(200, { required: true }),
    workMode: s(60),
    housingType: s(60),
    ownershipStatus: s(60),
    yardType: s(60),
    allowPetsConfirmed: { type: Boolean, default: false },
    currentPets: s(60),
    hoursAlone: s(60),
    vetCareCommitted: s(120),
    experience: s(120),
    notes: s(1000),

    // Same wording as the admin AdoptionReviews page
    status: { type: String, enum: ["Needs Review", "Approved", "Rejected"], default: "Needs Review", index: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    reviewNote: s(500),
  },
  { timestamps: true }
);

// One application per person per pet - enforced by the database itself, not only in code.
applicationSchema.index({ post: 1, applicant: 1 }, { unique: true });

export default mongoose.model("AdoptionApplication", applicationSchema);
