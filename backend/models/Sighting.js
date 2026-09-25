import mongoose from "mongoose";

// Field names are unchanged from the original model so the existing frontend/admin keep working.
const sightingSchema = new mongoose.Schema(
  {
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // --- Step 1: Animal Category & Appearance ---
    animalType: { type: String, enum: ["Dog", "Cat"], required: true },
    approximateSize: { type: String, required: true, trim: true, maxlength: 60 },
    keyFeatures: { type: String, trim: true, maxlength: 200 },

    // --- Step 2: Photo (a URL, not the raw file) ---
    photoUrl: { type: String, trim: true, maxlength: 2048 },

    // --- Step 3: Location & Sighting Timing ---
    location: { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
    spottedAt: { type: Date, default: Date.now },
    condition: {
      type: String,
      enum: ["Appears Healthy", "Needs Vet Care", "Trapped or Scared", "Calm / Eating"],
      required: true,
    },

    // --- Step 4: Volunteer Field Notes & Dispatch Contact ---
    notes: { type: String, trim: true, maxlength: 1000 },
    reporterPhone: { type: String, trim: true, maxlength: 20 }, // private: only reporter + admins ever see it
    receiveUpdates: { type: Boolean, default: true },

    // --- Publishing & lifecycle ---
    postStatus: { type: String, enum: ["draft", "published"], default: "published" },
    rescueStatus: { type: String, enum: ["Spotted", "Needs Foster", "Rescue Resolved"], default: "Spotted" },
    // Admin moderation: a sighting only appears in the public feed once it is "Approved" or "Rescued".
    moderationStatus: {
      type: String,
      enum: ["Pending for Approval", "Approved", "Rejected", "Rescued"],
      default: "Pending for Approval",
    },

    // --- Engagement ---
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

sightingSchema.index({ postStatus: 1, rescueStatus: 1, animalType: 1 });
sightingSchema.index({ reportedBy: 1 });
sightingSchema.index({ moderationStatus: 1, createdAt: -1 });

export default mongoose.model("Sighting", sightingSchema);
