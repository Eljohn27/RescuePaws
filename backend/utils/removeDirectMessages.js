import DirectConversation from "../models/DirectConversation.js";
import DirectMessage from "../models/DirectMessage.js";
import Notification from "../models/Notification.js";

export default async function removeDirectMessages(userId, session) {
  let query = DirectConversation.find({ participants: userId }).select("_id");
  if (session) query = query.session(session);
  const ids = (await query).map((conversation) => conversation._id);
  if (!ids.length) return [];

  const options = session ? { session } : {};
  if (session) {
    await DirectMessage.deleteMany({ conversation: { $in: ids } }, options);
    await DirectConversation.deleteMany({ _id: { $in: ids } }, options);
    await Notification.deleteMany({ category: "Messages", relatedId: { $in: ids } }, options);
  } else {
    await Promise.all([
      DirectMessage.deleteMany({ conversation: { $in: ids } }, options),
      DirectConversation.deleteMany({ _id: { $in: ids } }, options),
      Notification.deleteMany({ category: "Messages", relatedId: { $in: ids } }, options),
    ]);
  }
  return ids;
}
