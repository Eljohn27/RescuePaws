import express from "express";
import {
  getAdminsForMessages,
  getConversationMessages,
  getConversations,
  getMessageRecipients,
  getUnreadMessageCount,
  startConversation,
  sendMessage,
  blockConversation,
  unblockConversation,
} from "../controllers/messageController.js";
import * as v from "../validators/messageValidators.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";
import { messageSendLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();
router.use(protect);
router.get("/unread-count", getUnreadMessageCount);
router.get("/admins", getAdminsForMessages);
router.get("/users", v.searchUsers, validate, getMessageRecipients);
router.get("/conversations", getConversations);
router.post("/conversations", v.recipient, validate, startConversation);
router.get("/conversations/:id/messages", v.conversationId, validate, getConversationMessages);
router.post("/conversations/:id/messages", messageSendLimiter, v.sendMessage, validate, sendMessage);
router.post("/conversations/:id/block", v.conversationId, validate, blockConversation);
router.delete("/conversations/:id/block", v.conversationId, validate, unblockConversation);

export default router;
