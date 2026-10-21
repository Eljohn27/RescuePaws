import mongoose from "mongoose";
import { matchedData } from "express-validator";
import User from "../models/User.js";
import DirectConversation from "../models/DirectConversation.js";
import DirectMessage from "../models/DirectMessage.js";
import Notification from "../models/Notification.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { notify } from "../utils/notify.js";
import { publicName } from "../utils/serializers.js";

const safeUser = (user) => ({
  id: String(user._id),
  name: publicName(user.name),
  avatar: user.avatar || "",
  isAdmin: (user.roles || []).includes("admin"),
});

// `participants` may contain raw ObjectIds or populated User documents. Normalize
// both forms before checking membership so valid threads remain accessible after populate().
const ownsConversation = (conversation, userId) => conversation && conversation.participants.some((participant) =>
  String(participant?._id || participant) === String(userId),
);

const otherParticipant = (conversation, userId) => conversation.participants.find((participant) => String(participant._id || participant) !== String(userId));

const serializeConversation = (conversation, userId, unreadCount = 0) => {
  const other = otherParticipant(conversation, userId);
  return {
    id: String(conversation._id),
    otherUser: other && other.name ? safeUser(other) : null,
    lastMessage: conversation.lastMessageText,
    lastMessageAt: conversation.lastMessageAt,
    unreadCount,
    blockedByMe: conversation.blockedBy.some((id) => String(id) === String(userId)),
    blockedByOther: conversation.blockedBy.some((id) => String(id) !== String(userId)),
  };
};

export const getMessageRecipients = asyncHandler(async (req, res) => {
  const { q } = matchedData(req, { locations: ["query"] });
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const users = await User.find({ _id: { $ne: req.userId }, name: { $regex: escaped, $options: "i" } })
    .select("name avatar roles")
    .sort({ name: 1 })
    .limit(15);
  res.json({ users: users.map(safeUser) });
});

export const getAdminsForMessages = asyncHandler(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.userId }, roles: "admin" })
    .select("name avatar roles")
    .sort({ name: 1 })
    .limit(20);
  res.json({ users: users.map(safeUser) });
});

export const getConversations = asyncHandler(async (req, res) => {
  const conversations = await DirectConversation.find({ participants: req.userId })
    .populate("participants", "name avatar roles")
    .sort({ lastMessageAt: -1 })
    .limit(100);
  const ids = conversations.map((item) => item._id);
  const counts = ids.length ? await DirectMessage.aggregate([
    { $match: { conversation: { $in: ids }, recipient: new mongoose.Types.ObjectId(req.userId), readAt: null } },
    { $group: { _id: "$conversation", count: { $sum: 1 } } },
  ]) : [];
  const unread = new Map(counts.map((item) => [String(item._id), item.count]));
  res.json({ conversations: conversations.map((item) => serializeConversation(item, req.userId, unread.get(String(item._id)) || 0)) });
});

export const getUnreadMessageCount = asyncHandler(async (req, res) => {
  res.json({ unreadCount: await DirectMessage.countDocuments({ recipient: req.userId, readAt: null }) });
});

export const startConversation = asyncHandler(async (req, res) => {
  const { recipientId } = matchedData(req, { locations: ["body"] });
  if (String(recipientId) === String(req.userId)) throw new ApiError(400, "You cannot message yourself");
  const recipient = await User.findById(recipientId).select("name avatar roles");
  if (!recipient) throw new ApiError(404, "Member not found");

  const pair = [String(req.userId), String(recipient._id)].sort();
  const pairKey = pair.join(":");
  let conversation = await DirectConversation.findOne({ pairKey });
  if (!conversation) {
    try {
      conversation = await DirectConversation.create({ pairKey, participants: pair });
    } catch (error) {
      if (error.code !== 11000) throw error;
      conversation = await DirectConversation.findOne({ pairKey });
    }
  }
  await conversation.populate("participants", "name avatar roles");
  res.status(200).json({ conversation: serializeConversation(conversation, req.userId) });
});

export const getConversationMessages = asyncHandler(async (req, res) => {
  const conversation = await DirectConversation.findById(req.params.id).populate("participants", "name avatar roles");
  if (!ownsConversation(conversation, req.userId)) throw new ApiError(404, "Conversation not found");

  const messages = await DirectMessage.find({ conversation: conversation._id }).sort({ createdAt: -1 }).limit(100);
  await DirectMessage.updateMany({ conversation: conversation._id, recipient: req.userId, readAt: null }, { readAt: new Date() });
  await Notification.updateMany({ user: req.userId, category: "Messages", relatedId: conversation._id, isRead: false }, { isRead: true });

  res.json({
    conversation: serializeConversation(conversation, req.userId),
    messages: messages.reverse().map((message) => ({
      id: String(message._id),
      senderId: String(message.sender),
      recipientId: String(message.recipient),
      text: message.text,
      createdAt: message.createdAt,
      readAt: message.readAt,
    })),
  });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { text } = matchedData(req, { locations: ["body"] });
  const conversation = await DirectConversation.findById(req.params.id);
  if (!ownsConversation(conversation, req.userId)) throw new ApiError(404, "Conversation not found");
  if (conversation.blockedBy.length) throw new ApiError(403, "Messaging is blocked in this conversation");
  const recipientId = conversation.participants.find((id) => String(id) !== String(req.userId));
  const message = await DirectMessage.create({ conversation: conversation._id, sender: req.userId, recipient: recipientId, text });
  conversation.lastMessageText = text;
  conversation.lastMessageAt = message.createdAt;
  await conversation.save();

  const sender = await User.findById(req.userId).select("name");
  await notify(recipientId, {
    category: "Messages",
    title: `New message from ${publicName(sender?.name || "RescuePaws member")}`,
    message: text.slice(0, 160),
    relatedId: conversation._id,
  });
  res.status(201).json({ message: { id: String(message._id), senderId: String(message.sender), recipientId: String(message.recipient), text: message.text, createdAt: message.createdAt, readAt: null } });
});

export const blockConversation = asyncHandler(async (req, res) => {
  const conversation = await DirectConversation.findById(req.params.id);
  if (!ownsConversation(conversation, req.userId)) throw new ApiError(404, "Conversation not found");
  await DirectConversation.updateOne({ _id: conversation._id }, { $addToSet: { blockedBy: req.userId } });
  res.json({ blocked: true });
});

export const unblockConversation = asyncHandler(async (req, res) => {
  const conversation = await DirectConversation.findById(req.params.id);
  if (!ownsConversation(conversation, req.userId)) throw new ApiError(404, "Conversation not found");
  await DirectConversation.updateOne({ _id: conversation._id }, { $pull: { blockedBy: req.userId } });
  res.json({ blocked: false });
});
