import express from "express";
import { getMyProofs, getAllProofs, reviewProof } from "../controllers/proofController.js";
import * as v from "../validators/proofValidators.js";
import { validate } from "../middleware/validate.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/mine", getMyProofs);                                                     // my own proofs
router.get("/", authorize("admin"), v.listAll, validate, getAllProofs);              // admin: all proofs
router.patch("/:id/review", authorize("admin"), v.review, validate, reviewProof);    // admin: approve -> Rescued / reject

export default router;
