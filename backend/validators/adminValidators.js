import { query } from "express-validator";
import { pagination, idParam, roleList, personName, phone11 } from "./common.js";
import { ROLES } from "../utils/roles.js";

export const users = [...pagination, query("role").optional().isIn(ROLES).withMessage("Invalid role filter")];
export const setRoles = [idParam("id"), ...roleList("roles", ROLES)];
export const updateUser = [idParam("id"), personName("name", "Name").optional(), phone11("phone").optional()];
export const idOnly = [idParam("id")];
export const auditLogs = [
  ...pagination,
  query("outcome").optional().isIn(["success", "failure", "denied"]).withMessage("Invalid outcome"),
];
