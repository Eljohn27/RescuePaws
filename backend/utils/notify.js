import Notification from "../models/Notification.js";
import User from "../models/User.js";

const clip = (value = "", max) => String(value ?? "").slice(0, max);

// In-app notification. It never throws (a failure here must not break the request) and resolves once the
// notification is saved, so moderation handlers can `await` it and be sure the person really got the message.
export const notify = async (userId, { category = "System", title, message = "", relatedId }) => {
  if (!userId) return null;
  try {
    return await Notification.create({ user: userId, category, title: clip(title, 120), message: clip(message, 600), relatedId });
  } catch (err) {
    console.error("Notification write failed:", err.message);
    return null;
  }
};

export const notifyAdmins = async ({ category = "System", title, message = "", relatedId }) => {
  try {
    const admins = await User.find({ roles: "admin" }).select("_id");
    if (admins.length) {
      await Notification.insertMany(admins.map((a) => ({ user: a._id, category, title: clip(title, 120), message: clip(message, 600), relatedId })));
    }
  } catch (err) {
    console.error("Admin notification failed:", err.message);
  }
};
