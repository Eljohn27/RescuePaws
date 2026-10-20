import mongoose from "mongoose";
const postReportSchema = new mongoose.Schema({
 reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
 postType: { type: String, enum: ["sighting", "foster"], required: true },
 postId: { type: mongoose.Schema.Types.ObjectId, required: true },
 postTitle: { type: String, trim: true, maxlength: 120, default: "" },
 reason: { type: String, trim: true, maxlength: 120, required: true },
 details: { type: String, trim: true, maxlength: 1000, default: "" },
 status: { type: String, enum: ["New", "Reviewed", "Action Taken", "Dismissed"], default: "New" },
 adminNote: { type: String, trim: true, maxlength: 500, default: "" },
}, { timestamps: true });
postReportSchema.index({ status: 1, createdAt: -1 });
export default mongoose.model("PostReport", postReportSchema);
