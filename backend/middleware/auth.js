import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import audit from "../utils/audit.js";
import { verifyToken } from "../utils/generateToken.js";

const getToken = (req) => {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  return scheme === "Bearer" && token ? token : null;
};

export const protect = asyncHandler(async (req, res, next) => {
  const token = getToken(req);
  if (!token) throw new ApiError(401, "Not authorized, no token");

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    if (err.name === "TokenExpiredError") throw new ApiError(401, "Session expired, please log in again");
    audit(req, "auth.token.invalid", { outcome: "failure" });
    throw new ApiError(403, "Not authorized, token invalid");
  }

  const user = await User.findById(decoded.id).select("name roles tokenVersion");
  if (!user) throw new ApiError(401, "Not authorized, account no longer exists");

  // Token was issued before the user's last logout (or an admin force-logout) — reject it
  // even though the JWT signature itself is still valid and not yet expired.
  if (decoded.v !== user.tokenVersion) {
    audit(req, "auth.token.stale", { outcome: "failure" });
    throw new ApiError(401, "Session expired, please log in again");
  }

  req.userId = String(user._id);
  req.user = { id: String(user._id), roles: user.roles, name: user.name };
  next();
});

// For public endpoints that show a bit more to logged-in users. Never fails the request.
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = getToken(req);
  if (token) {
    try {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select("name roles tokenVersion");
      if (user && decoded.v === user.tokenVersion) {
        req.userId = String(user._id);
        req.user = { id: String(user._id), roles: user.roles, name: user.name };
      }
    } catch (err) {
      /* invalid token on a public route: treat as anonymous */
    }
  }
  next();
});

export const authorize = (...allowed) => (req, res, next) => {
  if (!req.user) return next(new ApiError(401, "Not authorized, no token"));
  if (!req.user.roles.some((r) => allowed.includes(r))) {
    audit(req, "access.denied", {
      resource: "route",
      outcome: "denied",
      meta: { method: req.method, path: req.originalUrl.split("?")[0], required: allowed },
    });
    return next(new ApiError(403, "You do not have permission to perform this action"));
  }
  return next();
};

// Kept from the original file so existing imports keep working.
export const adminOnly = authorize("admin");
