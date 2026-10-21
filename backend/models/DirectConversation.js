import mongoose from "mongoose";

const directConversationSchema = new mongoose.Schema({
  pairKey: { type: String, required: true, unique: true, index: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true }],
  blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  lastMessageText: { type: String, trim: true, maxlength: 2000, default: "" },
  lastMessageAt: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

directConversationSchema.index({ participants: 1, lastMessageAt: -1 });

export default mongoose.model("DirectConversation", directConversationSchema);
