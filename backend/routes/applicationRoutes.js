import express from "express";
import {
  getMyApplications,
  getReceivedApplications,
  getAllApplications,
  reviewApplication,
  withdrawApplication,
} from "../controllers/applicationController.js";
import * as v from "../validators/applicationValidators.js";
import { validate } from "../middleware/validate.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/mine", protect, getMyApplications);                                                    // requests I sent
router.get("/received", protect, getReceivedApplications);                                         // requests for MY listings (poster inbox)
router.get("/", protect, authorize("admin"), v.listAll, validate, getAllApplications);
router.patch("/:id/review", protect, v.review, validate, reviewApplication); // listing owner (or admin) approves / declines - checked in controller
router.delete("/:id", protect, v.idOnly, validate, withdrawApplication); // applicant (while under review) or admin (controller)

export default router;
