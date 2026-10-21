import mongoose from "mongoose";

const directMessageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: "DirectConversation", required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  text: { type: String, required: true, trim: true, minlength: 1, maxlength: 2000 },
  readAt: { type: Date, default: null, index: true },
}, { timestamps: true });

directMessageSchema.index({ conversation: 1, createdAt: 1 });
directMessageSchema.index({ recipient: 1, readAt: 1 });

export default mongoose.model("DirectMessage", directMessageSchema);
