import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import env from "./config/env.js";
import { apiLimiter } from "./middleware/rateLimiters.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import sightingRoutes from "./routes/sightingRoutes.js";
import adoptionRoutes from "./routes/adoptionRoutes.js";
import proofRoutes from "./routes/proofRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import uploadRoutes, { UPLOAD_DIR } from "./routes/uploadRoutes.js";

const app = express();

app.disable("x-powered-by");
if (env.isProd) app.set("trust proxy", 1); // behind a host's proxy (Render etc.) so rate limits see the real client IP

// --- Security middleware (order matters: these run before routes) ---
app.use(helmet());
app.use(cors({ origin: env.clientOrigins, credentials: true })); // only your own frontends may call the API
// Photo uploads need a bigger body limit than the rest of the API, so they are mounted BEFORE the 10kb parser.
app.use("/api/uploads", apiLimiter, uploadRoutes);
// Saved photos are public. "cross-origin" lets the frontends (other ports) show them; nosniff stops odd content-type tricks.
app.use("/uploads", express.static(UPLOAD_DIR, {
  maxAge: "7d",
  setHeaders: (res) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("X-Content-Type-Options", "nosniff");
  },
}));
app.use(express.json({ limit: "10kb" }));                        // caps request body size
app.use(mongoSanitize());                                        // blocks NoSQL injection like { "email": { "$gt": "" } }
app.use("/api", apiLimiter);                                     // general per-IP rate limit (login/register have stricter ones)

// --- Routes ---
app.get("/", (req, res) => res.json({ message: "RescuePaws API is running" }));
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sightings", sightingRoutes);
app.use("/api/adoptions", adoptionRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/proofs", proofRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
