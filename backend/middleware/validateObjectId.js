import mongoose from "mongoose";

// Use on any route with an :id param (e.g. /api/sightings/:id).
// Without this, a malformed id (e.g. "abc123") reaches Mongoose's
// findById() and throws a CastError. That error's default message
// exposes internal details like the schema path and expected type
// ("Cast to ObjectId failed for value \"abc123\" at path \"_id\" ...").
// Catching bad ids here means the controller's try/catch never even
// sees that error — the client just gets a clean 400.
export const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }
  next();
};
