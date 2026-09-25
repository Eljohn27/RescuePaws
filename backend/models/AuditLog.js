import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    actorRoles: [{ type: String, maxlength: 20 }],
    action: { type: String, required: true, maxlength: 60 },
    resource: { type: String, maxlength: 40 },
    resourceId: { type: String, maxlength: 40 },
    outcome: { type: String, enum: ["success", "failure", "denied"], default: "success" },
    ip: { type: String, maxlength: 64 },
    userAgent: { type: String, maxlength: 200 },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
auditLogSchema.index({ createdAt: -1 });

export default mongoose.model("AuditLog", auditLogSchema);
