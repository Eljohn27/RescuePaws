// Audit logging: records security-relevant events in the AuditLog collection.
// Never pass passwords, tokens or other secrets in `meta`.
import AuditLog from "../models/AuditLog.js";

const audit = (req, action, { actor, resource, resourceId, outcome = "success", meta } = {}) => {
  AuditLog.create({
    action,
    resource,
    resourceId: resourceId ? String(resourceId) : undefined,
    outcome,
    actor: actor || (req.user && req.user.id) || undefined,
    actorRoles: req.user ? req.user.roles : undefined,
    ip: req.ip,
    userAgent: (req.get("user-agent") || "").slice(0, 200),
    meta,
  }).catch((err) => console.error("Audit log write failed:", err.message)); // never break the request
};

export default audit;
