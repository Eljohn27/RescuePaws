import express from "express";
import {
  createSighting,
  getSightings,
  getMySightings,
  getSightingById,
  updateSighting,
  toggleLike,
  deleteSighting,
  getAllSightingsAdmin,
  moderateSighting,
} from "../controllers/sightingController.js";
import { submitProof } from "../controllers/proofController.js";
import * as v from "../validators/sightingValidators.js";
import * as proofV from "../validators/proofValidators.js";
import { validate } from "../middleware/validate.js";
import { protect, optionalAuth, authorize } from "../middleware/auth.js";

const router = express.Router();

// Order matters: specific paths before /:id, or Express treats them as an id
router.get("/", optionalAuth, v.list, validate, getSightings);                                          // GET    /api/sightings           (public feed)
router.get("/mine", protect, getMySightings);                                                            // GET    /api/sightings/mine
router.get("/admin/all", protect, authorize("admin"), v.adminList, validate, getAllSightingsAdmin);     // GET    /api/sightings/admin/all (admin)
router.patch("/:id/moderate", protect, authorize("admin"), v.moderate, validate, moderateSighting);     // PATCH  /api/sightings/:id/moderate (admin)
router.patch("/:id/like", protect, v.idOnly, validate, toggleLike);                                      // PATCH  /api/sightings/:id/like
router.post("/:id/proofs", protect, authorize("adopter", "reporter"), proofV.submit, validate, submitProof);       // POST   /api/sightings/:id/proofs (adopter: "I got this stray")
router.get("/:id", optionalAuth, v.idOnly, validate, getSightingById);                                   // GET    /api/sightings/:id
router.post("/", protect, authorize("reporter", "adopter", "admin"), v.create, validate, createSighting);          // POST   /api/sightings           (reporter, admin)
router.put("/:id", protect, v.update, validate, updateSighting);                                         // PUT    /api/sightings/:id       (owner or admin - checked in controller)
router.delete("/:id", protect, v.idOnly, validate, deleteSighting);                                      // DELETE /api/sightings/:id       (owner or admin - checked in controller)

export default router;
