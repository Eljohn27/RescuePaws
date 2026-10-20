import mongoose from "mongoose";

export const REPORT_REASONS = [
  "Spam or fake post",
  "Not a real stray or pet",
  "Inappropriate content",
  "Wrong or misleading information",
  "Animal abuse or selling animals",
  "Other",
];

// A member flagging someone else's post so an admin can look at it.
const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    targetType: { type: String, enum: ["sighting", "adoption"], required: true },
    target: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    reason: { type: String, enum: REPORT_REASONS, required: true },
    details: { type: String, trim: true, maxlength: 300, default: "" },
    status: { type: String, enum: ["Open", "Dismissed", "Actioned"], default: "Open", index: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    reviewNote: { type: String, trim: true, maxlength: 500, default: "" },
  },
  { timestamps: true }
);

// One open report per person per post.
reportSchema.index({ reporter: 1, target: 1 }, { unique: true, partialFilterExpression: { status: "Open" } });

export default mongoose.model("Report", reportSchema);
