import express from "express";
import { updateMe, changePassword } from "../controllers/userController.js";
import * as v from "../validators/userValidators.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.patch("/me", protect, v.updateMe, validate, updateMe);
router.patch("/me/password", protect, v.changePassword, validate, changePassword);

export default router;
