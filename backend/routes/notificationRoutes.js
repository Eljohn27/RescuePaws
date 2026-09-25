import express from "express";
import { getNotifications, markAllRead, markRead } from "../controllers/notificationController.js";
import * as v from "../validators/notificationValidators.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/", getNotifications);
router.patch("/read-all", markAllRead);
router.patch("/:id/read", v.idOnly, validate, markRead);

export default router;
