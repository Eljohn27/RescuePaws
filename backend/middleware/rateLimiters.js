import rateLimit from "express-rate-limit";
import env from "../config/env.js";

const make = ({ message = "Too many requests, please try again later", ...opts }) =>
  rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => res.status(429).json({ message, data: null, error: { message } }),
    ...opts,
  });
export const apiLimiter = make({ windowMs: 15 * 60 * 1000, limit: env.apiRateLimitMax });

export const loginLimiter = make({
  windowMs: env.authRateLimitWindowMin * 60 * 1000,
  limit: env.authRateLimitMax,
  skipSuccessfulRequests: true,
  message: "Too many login attempts, please try again later",
});

export const registerLimiter = make({
  windowMs: 60 * 60 * 1000,
  limit: env.authRateLimitMax,
  message: "Too many registration attempts, please try again later",
});
