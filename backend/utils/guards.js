import ApiError from "./ApiError.js";
import audit from "./audit.js";

export const hasRole = (user, ...roles) => !!user && roles.some((r) => user.roles.includes(r));
export const isAdmin = (user) => hasRole(user, "admin");

// True when `ref` (ObjectId, populated document or null) belongs to `userId`.
export const isOwner = (ref, userId) => !!ref && String(ref._id || ref) === String(userId);

// Builds a 403 error and records the denied attempt in the audit log.  Usage: throw forbid(req, "sighting", id)
export const forbid = (req, resource, resourceId) => {
  audit(req, "access.denied", {
    resource,
    resourceId,
    outcome: "denied",
    meta: { method: req.method, path: req.originalUrl.split("?")[0] },
  });
  return new ApiError(403, "You do not have permission to perform this action");
};
