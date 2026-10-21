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
export const messageSendLimiter = make({ windowMs: 60 * 1000, limit: 30, message: "You are sending messages too quickly. Please wait a minute." });

export const loginLimiter = make({
  windowMs: env.authRateLimitWindowMin * 60 * 1000,
  limit: env.authRateLimitMax,
  skipSuccessfulRequests: true,
  message: "Too many login attempts, please try again later",
});

export const resendOtpLimiter = make({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  message: "Too many code requests. Please wait before trying again.",
});

export const resendRegistrationOtpLimiter = make({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  message: "Too many verification code requests. Please wait before trying again.",
});

export const verifyRegistrationOtpLimiter = make({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: "Too many verification attempts. Please try again later.",
});

export const forgotPasswordLimiter = make({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: "Too many password reset requests. Please wait before trying again.",
});

export const resetPasswordLimiter = make({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: "Too many attempts. Please wait before trying again.",
});

export const passwordChangeLimiter = make({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  message: "Too many password change attempts. Please wait before trying again.",
});

export const registerLimiter = make({
  windowMs: 60 * 60 * 1000,
  limit: env.authRateLimitMax,
  message: "Too many registration attempts, please try again later",
});
