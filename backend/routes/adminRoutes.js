import express from "express";
import { getStats, listUsers, updateUser, setUserRoles, deleteUser, getAuditLogs } from "../controllers/adminController.js";
import * as v from "../validators/adminValidators.js";
import { validate } from "../middleware/validate.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/stats", getStats);
router.get("/users", v.users, validate, listUsers);
router.patch("/users/:id", v.updateUser, validate, updateUser);
router.patch("/users/:id/roles", v.setRoles, validate, setUserRoles);
router.delete("/users/:id", v.idOnly, validate, deleteUser);
router.get("/audit-logs", v.auditLogs, validate, getAuditLogs);

export default router;
