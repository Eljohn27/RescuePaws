import Notification from "../models/Notification.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { serializeNotification } from "../utils/serializers.js";

// @route   GET /api/notifications
// @access  Private (own notifications only)
export const getNotifications = asyncHandler(async (req, res) => {
  const [items, unreadCount] = await Promise.all([
    Notification.find({ user: req.userId }).sort({ createdAt: -1 }).limit(50),
    Notification.countDocuments({ user: req.userId, isRead: false }),
  ]);
  res.json({ notifications: items.map(serializeNotification), unreadCount });
});

// @route   PATCH /api/notifications/read-all
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.userId, isRead: false }, { isRead: true });
  res.json({ message: "All notifications marked as read" });
});

// @route   PATCH /api/notifications/:id/read
export const markRead = asyncHandler(async (req, res) => {
  // the filter includes the user id, so people can only touch their own notifications
  const n = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.userId }, { isRead: true }, { new: true });
  if (!n) throw new ApiError(404, "Notification not found");
  res.json(serializeNotification(n));
});
