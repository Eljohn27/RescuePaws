import mongoose from "mongoose";

// Proof that someone has taken in a stray from a sighting post. The admin reviews it and, if approved,
// marks the sighting as "Rescued".
const rescueProofSchema = new mongoose.Schema(
  {
    sighting: { type: mongoose.Schema.Types.ObjectId, ref: "Sighting", required: true, index: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    photoUrl: { type: String, required: true, trim: true, maxlength: 2048 },
    message: { type: String, required: true, trim: true, minlength: 3, maxlength: 500 },

    status: { type: String, enum: ["Needs Review", "Approved", "Rejected"], default: "Needs Review", index: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    reviewNote: { type: String, trim: true, maxlength: 500, default: "" },
  },
  { timestamps: true }
);

// One proof waiting for review per person per sighting (they may send a new one after a rejection).
rescueProofSchema.index(
  { sighting: 1, submittedBy: 1 },
  { unique: true, partialFilterExpression: { status: "Needs Review" } }
);

export default mongoose.model("RescueProof", rescueProofSchema);
