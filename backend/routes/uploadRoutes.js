import express from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";
import { protect } from "../middleware/auth.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import audit from "../utils/audit.js";

const here = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = path.join(here, "..", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB per photo (the frontend shrinks photos before sending)
const TYPES = { jpeg: "jpg", png: "png", webp: "webp" };

// The first bytes of a real image file. We check these instead of trusting what the client says it is.
const looksLike = (buf, kind) =>
  kind === "jpeg" ? buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff
  : kind === "png" ? buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  : buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP";

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ message: "Too many uploads, please try again later" }),
});

const router = express.Router();

// @route   POST /api/uploads      Body: { image: "data:image/jpeg;base64,...." }
// @desc    Save a photo and return its public URL: { url }
// @access  Private (logged-in users only)
router.post(
  "/",
  protect,
  limiter,
  express.json({ limit: "3mb" }),
  asyncHandler(async (req, res) => {
    const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(typeof req.body?.image === "string" ? req.body.image : "");
    if (!m) throw new ApiError(400, "Please choose a JPG, PNG or WebP photo");
    const kind = m[1];
    const buf = Buffer.from(m[2], "base64");
    if (buf.length > MAX_BYTES) throw new ApiError(413, "Photo is too big (max 2 MB)");
    if (!looksLike(buf, kind)) throw new ApiError(400, "That file is not a real image");

    const name = `${crypto.randomBytes(16).toString("hex")}.${TYPES[kind]}`; // random name: users can't choose paths
    await fs.promises.writeFile(path.join(UPLOAD_DIR, name), buf);

    audit(req, "upload.create", { resource: "upload", meta: { name, bytes: buf.length } });
    res.status(201).json({ url: `${req.protocol}://${req.get("host")}/uploads/${name}` });
  })
);

export default router;
