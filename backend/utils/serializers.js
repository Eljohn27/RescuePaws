// Turns database documents into safe JSON for the frontends.
// These are whitelists: private fields (phone numbers, password hashes, ...) are never included by accident.

const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='#f1f5f9'/>" +
      "<text x='50%' y='52%' font-size='72' text-anchor='middle'>🐾</text></svg>"
  );

// "Anna Reyes" -> "Anna R."  (public pages never show full names)
export const publicName = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Deleted user";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
};

export const timeAgo = (date) => {
  const secs = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} ${mins === 1 ? "min" : "mins"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ${days === 1 ? "day" : "days"} ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const idOf = (v) => (v && v._id ? String(v._id) : v ? String(v) : undefined);

export const serializeUser = (u) => ({
  _id: String(u._id),
  name: u.name,
  email: u.email,
  phone: u.phone,
  roles: u.roles,
  location: u.location || "",
  avatar: u.avatar || "",
  createdAt: u.createdAt,
});

// ---------- sightings ----------
const BADGE_BG = { Spotted: "#0284c7", "Needs Foster": "#e11d48", "Rescue Resolved": "#16a34a" };

// Shape used by Home.jsx (name, description, location, time, image, badge, badgeBg, type, sighter)
// plus the raw fields. `viewer` = { id, roles } or undefined for anonymous visitors.
export const serializeSighting = (s, viewer) => {
  const owner = !!viewer && idOf(s.reportedBy) === viewer.id;
  const canSeeContact = owner || (!!viewer && viewer.roles.includes("admin"));
  const likes = s.likes || [];
  const feat = (s.keyFeatures || "").trim();
  const item = {
    id: String(s._id),
    _id: String(s._id),
    name: feat ? `${s.animalType} (${feat.length > 40 ? `${feat.slice(0, 37)}...` : feat})` : `${s.animalType} sighting`,
    description: s.notes || s.keyFeatures || "",
    location: s.location,
    time: timeAgo(s.spottedAt || s.createdAt),
    image: s.photoUrl || PLACEHOLDER_IMG,
    badge: s.rescueStatus,
    badgeBg: BADGE_BG[s.rescueStatus] || "#0284c7",
    needsFoster: s.rescueStatus === "Needs Foster",
    type: s.animalType,
    sighter: publicName(s.reportedBy && s.reportedBy.name),
    animalType: s.animalType,
    approximateSize: s.approximateSize,
    keyFeatures: s.keyFeatures,
    notes: s.notes,
    condition: s.condition,
    spottedAt: s.spottedAt,
    rescueStatus: s.rescueStatus,
    moderationStatus: s.moderationStatus,
    postStatus: s.postStatus,
    likeCount: likes.length,
    likedByMe: !!viewer && likes.some((id) => String(id) === viewer.id),
    isMine: owner,
    createdAt: s.createdAt,
  };
  if (canSeeContact) item.reporterPhone = s.reporterPhone; // private: reporter and admins only
  return item;
};

// ---------- adoption listings ----------
export const STATUS_TAGS = {
  "Ready for Home": { key: "ready", tag: "Ready to Adopt", bg: "#dcfce7", color: "#166534" },
  "In Foster Care": { key: "foster", tag: "In Foster Care", bg: "#e0f2fe", color: "#0369a1" },
  "Needs Medical Care First": { key: "medical", tag: "Needs Medical Care", bg: "#fef3c7", color: "#92400e" },
  Adopted: { key: "adopted", tag: "Adopted", bg: "#f1f5f9", color: "#475569" },
};

// Shape used by AdoptionFeed.jsx. `viewer` = { id, roles } or undefined for anonymous visitors.
// The admin's review note is private: only the listing's owner and admins get it.
export const serializeAdoption = (p, viewer) => {
  const t = STATUS_TAGS[p.listingStatus] || STATUS_TAGS["Ready for Home"];
  const canSeeReview = !!viewer && (idOf(p.owner) === viewer.id || viewer.roles.includes("admin"));
  const item = {
    id: String(p._id),
    _id: String(p._id),
    author: publicName(p.owner && p.owner.name),
    time: timeAgo(p.createdAt),
    location: p.location,
    description: p.description,
    image: p.photoUrl || PLACEHOLDER_IMG,
    category: String(p.animalType).toLowerCase(),
    statusTag: t.tag,
    statusTagBg: t.bg,
    statusTagColor: t.color,
    petName: p.petName,
    age: p.age,
    gender: p.gender,
    status: t.key,
    breed: p.breed,
    animalType: p.animalType,
    listingStatus: p.listingStatus,
    moderationStatus: p.moderationStatus,
    adoptedAt: p.adoptedAt,
    ownerId: idOf(p.owner),
    isMine: !!viewer && idOf(p.owner) === viewer.id,
    createdAt: p.createdAt,
  };
  if (canSeeReview) {
    item.reviewNote = p.reviewNote || "";
    item.reviewedAt = p.reviewedAt;
  }
  return item;
};

// ---------- adoption applications ----------
const initials = (name = "") =>
  name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");

// Shape used by the admin AdoptionReviews page. Expects `post` populated (with post.owner populated).
export const serializeApplication = (a) => {
  const post = a.post && a.post.petName ? a.post : {};
  return {
    id: String(a._id),
    _id: String(a._id),
    applicant: a.fullName,
    initials: initials(a.fullName),
    animal: post.petName,
    type: post.animalType,
    age: post.age,
    breed: post.breed,
    foster: post.owner && post.owner.name ? post.owner.name : undefined,
    postId: idOf(a.post),
    date: `Submitted ${new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
    status: a.status,
    img: post.photoUrl || PLACEHOLDER_IMG,
    contact: { email: a.email, phone: a.phone, address: a.address },
    details: {
      housingType: a.housingType,
      ownershipStatus: a.ownershipStatus,
      yardSpace: a.yardType,
      petPermissionConfirmed: a.allowPetsConfirmed,
      currentPets: a.currentPets,
      hoursAloneDaily: a.hoursAlone,
      vetCareCommitment: a.vetCareCommitted,
      rescueExperience: a.experience,
      notesToFoster: a.notes,
    },
    workMode: a.workMode,
    reviewNote: a.reviewNote,
    reviewedAt: a.reviewedAt,
    createdAt: a.createdAt,
  };
};

// ---------- notifications ----------
export const serializeNotification = (n) => ({
  id: String(n._id),
  _id: String(n._id),
  category: n.category,
  title: n.title,
  message: n.message,
  unread: !n.isRead,
  time: timeAgo(n.createdAt),
  relatedId: n.relatedId ? String(n.relatedId) : undefined,
  createdAt: n.createdAt,
});

// ---------- rescue proofs (stray sightings) ----------
// `withContact` = true only for admins (the submitter's email/phone).
export const serializeProof = (pr, { withContact = false } = {}) => {
  const s = pr.sighting && pr.sighting.location ? pr.sighting : {};
  const u = pr.submittedBy && pr.submittedBy.name ? pr.submittedBy : null;
  const item = {
    id: String(pr._id),
    _id: String(pr._id),
    sightingId: idOf(pr.sighting),
    sighting: { animalType: s.animalType, location: s.location, image: s.photoUrl || PLACEHOLDER_IMG, moderationStatus: s.moderationStatus },
    submittedBy: u ? publicName(u.name) : "Deleted user",
    photoUrl: pr.photoUrl,
    message: pr.message,
    status: pr.status,
    reviewNote: pr.reviewNote || "",
    reviewedAt: pr.reviewedAt,
    createdAt: pr.createdAt,
  };
  if (withContact && u) item.contact = { name: u.name, email: u.email, phone: u.phone };
  return item;
};
