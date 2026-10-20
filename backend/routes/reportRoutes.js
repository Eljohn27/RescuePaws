import express from "express";
import { createReport, getReports, reviewReport } from "../controllers/reportController.js";
import * as v from "../validators/reportValidators.js";
import { validate } from "../middleware/validate.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.post("/", v.create, validate, createReport);                                        // any member
router.get("/", authorize("admin"), v.list, validate, getReports);                         // admin queue
router.patch("/:id/review", authorize("admin"), v.review, validate, reviewReport);         // admin: dismiss / take down

export default router;
