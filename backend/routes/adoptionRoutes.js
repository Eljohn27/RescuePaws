import express from "express";
import {
  getAdoptions,
  getMyAdoptions,
  getAllAdoptionsAdmin,
  getAdoptionById,
  createAdoption,
  updateAdoption,
  moderateAdoption,
  deleteAdoption,
} from "../controllers/adoptionController.js";
import { submitApplication, getApplicationsForPost } from "../controllers/applicationController.js";
import * as v from "../validators/adoptionValidators.js";
import * as appV from "../validators/applicationValidators.js";
import { validate } from "../middleware/validate.js";
import { protect, optionalAuth, authorize } from "../middleware/auth.js";

const router = express.Router();

// Order matters: specific paths before /:id, or Express treats them as an id
router.get("/", optionalAuth, v.list, validate, getAdoptions);                                            // public feed (approved listings only)
router.get("/mine", protect, getMyAdoptions);                                                             // own listings in every state
router.get("/admin/all", protect, authorize("admin"), v.adminList, validate, getAllAdoptionsAdmin);      // admin review queue
router.patch("/:id/moderate", protect, authorize("admin"), v.moderate, validate, moderateAdoption);      // admin approves / rejects a listing
router.get("/:id", optionalAuth, v.idOnly, validate, getAdoptionById);
router.post("/", protect, authorize("reporter", "adopter", "admin"), v.create, validate, createAdoption);           // reporter, admin
router.put("/:id", protect, v.update, validate, updateAdoption);                                          // owner or admin (controller)
router.delete("/:id", protect, v.idOnly, validate, deleteAdoption);                                       // owner or admin (controller)

// Applications belong to a listing
router.post("/:id/applications", protect, authorize("adopter", "reporter"), appV.submit, validate, submitApplication); // adopter
router.get("/:id/applications", protect, appV.idOnly, validate, getApplicationsForPost);                   // listing owner or admin (controller)

export default router;
