import Notification from "../models/Notification.js";
import User from "../models/User.js";

// Fire-and-forget in-app notifications (a failure here must never break the request).
export const notify = (userId, { category = "System", title, message, relatedId }) => {
  if (!userId) return;
  Notification.create({ user: userId, category, title, message, relatedId }).catch((err) =>
    console.error("Notification write failed:", err.message)
  );
};

export const notifyAdmins = async ({ category = "System", title, message, relatedId }) => {
  try {
    const admins = await User.find({ roles: "admin" }).select("_id");
    if (admins.length) {
      await Notification.insertMany(admins.map((a) => ({ user: a._id, category, title, message, relatedId })));
    }
  } catch (err) {
    console.error("Admin notification failed:", err.message);
  }
};
