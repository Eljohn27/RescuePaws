import jwt from "jsonwebtoken";
import env from "../config/env.js";

// Signed (HS256), expiring (JWT_EXPIRES_IN, default 1 day). Carries the user id
// and the tokenVersion that was current at issue time — protect() compares that
// against the live value in the database, so a logout (which bumps tokenVersion)
// invalidates the token immediately instead of waiting for it to expire.
export const generateToken = (userId, tokenVersion = 0) =>
  jwt.sign({ id: String(userId), v: tokenVersion }, env.jwtSecret, { algorithm: "HS256", expiresIn: env.jwtExpiresIn });

export const verifyToken = (token) => jwt.verify(token, env.jwtSecret, { algorithms: ["HS256"] });

export default generateToken;
