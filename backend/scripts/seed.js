// Creates the test accounts required by the project guidelines (and optional demo content).
//   npm run seed            -> admin / reporter / adopter test accounts (existing accounts are never overwritten)
//   npm run seed:demo       -> the same + a few sample sightings and adoption listings
// In production (NODE_ENV=production) the passwords MUST be supplied through environment variables.
import mongoose from "mongoose";
import env from "../config/env.js";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Sighting from "../models/Sighting.js";
import AdoptionPost from "../models/AdoptionPost.js";

const demo = process.argv.includes("--demo");

const STRONG = (p) => p.length >= 8 && Buffer.byteLength(p) <= 72 && /[a-z]/.test(p) && /[A-Z]/.test(p) && /[0-9]/.test(p);
const password = (name, devDefault) => {
  const v = process.env[name] || (env.isProd ? undefined : devDefault);
  if (!v) { console.error(`${name} is required when NODE_ENV=production.`); process.exit(1); }
  if (!STRONG(v)) { console.error(`${name} must be 8-72 characters with an uppercase letter, a lowercase letter and a number.`); process.exit(1); }
  return v;
};

const accounts = [
  { name: "Ada Admin", email: (process.env.SEED_ADMIN_EMAIL || "admin@test.com").toLowerCase(), phone: "09170000001", roles: ["admin"], password: password("SEED_ADMIN_PASSWORD", "Admin@12345") },
  { name: "Rita Reporter", email: "reporter@test.com", phone: "09170000002", roles: ["reporter"], password: password("SEED_REPORTER_PASSWORD", "Reporter@12345") },
  { name: "Adam Adopter", email: "adopter@test.com", phone: "09170000003", roles: ["adopter"], password: password("SEED_ADOPTER_PASSWORD", "Adopter@12345") },
];

await connectDB();

const created = {};
for (const a of accounts) {
  let user = await User.findOne({ email: a.email });
  if (user) console.log(`exists   ${a.email}  (${user.roles.join(", ")})`);
  else {
    user = await User.create({ ...a, termsAccepted: true }); // password is hashed by the model
    console.log(`created  ${a.email}  (${a.roles.join(", ")})`);
  }
  created[a.roles[0]] = user;
}

if (demo) {
  if ((await Sighting.countDocuments()) === 0) {
    const r = created.reporter._id;
    await Sighting.insertMany([
      { reportedBy: r, animalType: "Cat", approximateSize: "Small", keyFeatures: "Calico, orange patch over left eye", photoUrl: "/milo.jpg", location: "Main Library Plaza", condition: "Calm / Eating", notes: "Spotted near the University Library. Very friendly and looks well-fed.", rescueStatus: "Needs Foster", moderationStatus: "Approved" },
      { reportedBy: r, animalType: "Dog", approximateSize: "Medium", keyFeatures: "Blue collar", photoUrl: "/bruno.jpg", location: "Student Center", condition: "Appears Healthy", notes: "Resting near the Student Union cafeteria. Has a blue collar.", rescueStatus: "Spotted", moderationStatus: "Approved" },
      { reportedBy: r, animalType: "Dog", approximateSize: "Medium", keyFeatures: "Tan/white terrier mix, limping", location: "West Elm Square near grocery", condition: "Needs Vet Care", notes: "Noticeably limping on right front paw. Not aggressive, appears timid.", reporterPhone: "09170000002" }, // stays "Pending for Approval" so the admin has something to moderate
    ]);
    console.log("created  3 demo sightings (2 approved, 1 pending moderation)");
  } else console.log("skipped  demo sightings (collection not empty)");

  if ((await AdoptionPost.countDocuments()) === 0) {
    const o = created.reporter._id;
    await AdoptionPost.insertMany([
      { owner: o, petName: "Milo", animalType: "Dog", gender: "Male", age: "4 Year Old", breed: "Scruffy mix", location: "Peoples Park, Davao City", photoUrl: "/milo.jpg", description: "A sweet, fluffy dog rescued off the streets. Looking for a permanent home.", listingStatus: "In Foster Care", moderationStatus: "Approved" },
      { owner: o, petName: "Siopao", animalType: "Dog", gender: "Male", age: "3 Year Old", breed: "Shih Tzu mix", location: "Davao City", photoUrl: "/siopao.jpg", description: "Super fluffy, quiet and very affectionate.", listingStatus: "Ready for Home", moderationStatus: "Approved" },
      { owner: o, petName: "Bella", animalType: "Dog", gender: "Female", age: "2 Year Old", breed: "Light-cream mix", location: "España Blvd, Manila", photoUrl: "/bella.jpg", description: "A gentle, calm dog whose owner can no longer care for her.", listingStatus: "Ready for Home", moderationStatus: "Approved" },
      { owner: o, petName: "Kape", animalType: "Cat", gender: "Male", age: "1 Year Old", breed: "Brown tabby", location: "Davao City", photoUrl: "/kape.jpg", description: "Playful and curious. Waiting for admin approval.", listingStatus: "Ready for Home" }, // stays "Pending for Approval" so the admin has something to review
    ]);
    console.log("created  4 demo adoption listings (3 approved, 1 pending approval)");
  } else console.log("skipped  demo adoption listings (collection not empty)");
}

await mongoose.connection.close();
console.log("\nDone. Test accounts: admin@test.com / reporter@test.com / adopter@test.com (passwords: see README).");
