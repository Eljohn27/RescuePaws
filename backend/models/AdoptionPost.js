import mongoose from "mongoose";

const adoptionPostSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    petName: { type: String, required: true, trim: true, minlength: 1, maxlength: 60 },
    animalType: { type: String, enum: ["Dog", "Cat"], required: true },
    gender: { type: String, enum: ["Male", "Female"], required: true },
    age: { type: String, trim: true, maxlength: 40, default: "" },
    breed: { type: String, trim: true, maxlength: 100, default: "" },
    description: { type: String, trim: true, maxlength: 1500, default: "" },
    location: { type: String, required: true, trim: true, minlength: 2, maxlength: 150 },
    photoUrl: { type: String, trim: true, maxlength: 2048, default: "" },
    listingStatus: {
      type: String,
      enum: ["Ready for Home", "In Foster Care", "Needs Medical Care First", "Adopted"],
      default: "Ready for Home",
      index: true,
    },

    // Admin approval: a listing only appears in the public feed once it is "Approved".
    // New listings from regular users start as "Pending for Approval"; editing one puts it back to pending.
    moderationStatus: {
      type: String,
      enum: ["Pending for Approval", "Approved", "Rejected"],
      default: "Pending for Approval",
      index: true,
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    reviewNote: { type: String, trim: true, maxlength: 500, default: "" }, // e.g. why it was rejected

    // Filled in automatically when the poster approves an adoption request.
    adoptedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    adoptedAt: { type: Date },
  },
  { timestamps: true }
);

adoptionPostSchema.index({ moderationStatus: 1, createdAt: -1 });

export default mongoose.model("AdoptionPost", adoptionPostSchema);
