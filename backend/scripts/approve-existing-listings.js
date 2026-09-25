// One-time migration for databases that already contain adoption listings from BEFORE admin approval existed.
// Those listings have no moderationStatus, so they would disappear from the public feed. This marks them "Approved".
//   npm run migrate:approve-listings
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import AdoptionPost from "../models/AdoptionPost.js";

await connectDB();
const result = await AdoptionPost.updateMany(
  { moderationStatus: { $exists: false } },
  { $set: { moderationStatus: "Approved", reviewNote: "" } }
);
console.log(`Marked ${result.modifiedCount} existing listing(s) as Approved.`);
await mongoose.connection.close();
