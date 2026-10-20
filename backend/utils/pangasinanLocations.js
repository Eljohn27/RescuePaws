import placesData from "../../frontend/src/data/pangasinanPlaces.json" with { type: "json" };
import boundaryData from "../../frontend/src/data/pangasinanBoundary.json" with { type: "json" };
export const PANGASINAN_PLACES = placesData.places;
export const PLACE_BY_CODE = new Map(PANGASINAN_PLACES.map((place) => [place.code, place]));
export const DAGUPAN_CODE = "0105518000";
export const DAGUPAN_PLACE = PLACE_BY_CODE.get(DAGUPAN_CODE);
export const DAGUPAN_BARANGAYS = DAGUPAN_PLACE?.barangays ?? [];
export const DAGUPAN_BOUNDS = { south: 16.008933, north: 16.108713, west: 120.29875, east: 120.377899 };
export const DAGUPAN_BARANGAY_CODES = new Set(DAGUPAN_BARANGAYS.map((barangay) => barangay.code));
const boundaryPolygons = boundaryData.features[0].geometry.coordinates;

function pointInRing(longitude, latitude, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const crosses = (yi > latitude) !== (yj > latitude)
      && longitude < ((xj - xi) * (latitude - yi)) / (yj - yi) + xi;
    if (crosses) inside = !inside;
  }
  return inside;
}

export function isInPangasinan(latitude, longitude) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  return boundaryPolygons.some((polygon) =>
    pointInRing(lng, lat, polygon[0]) && !polygon.slice(1).some((hole) => pointInRing(lng, lat, hole))
  );
}

export function isInDagupan(latitude, longitude) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  return Number.isFinite(lat) && Number.isFinite(lng)
    && lat >= DAGUPAN_BOUNDS.south && lat <= DAGUPAN_BOUNDS.north
    && lng >= DAGUPAN_BOUNDS.west && lng <= DAGUPAN_BOUNDS.east;
}

// Legacy adoption posts can predate the Dagupan-only location fields. Treat a
// post as available only when its saved address can be positively placed in
// Dagupan; unknown or out-of-city locations are unavailable for adoption.
export function isDagupanAdoption(post) {
  const hasCoordinates = post?.latitude != null || post?.longitude != null;
  if (post?.cityMunicipalityCode) {
    if (String(post.cityMunicipalityCode) !== DAGUPAN_CODE || !resolveDagupanBarangay(post.cityMunicipalityCode, post.barangayCode)) return false;
    return !hasCoordinates || isInDagupan(post.latitude, post.longitude);
  }
  if (hasCoordinates) return isInDagupan(post.latitude, post.longitude);

  const location = String(post?.location || "").toLocaleLowerCase();
  if (/\bdagupan(?: city)?\b/.test(location)) return true;
  return false;
}

export function resolveDagupanBarangay(cityCode, barangayCode) {
  if (String(cityCode) !== DAGUPAN_CODE) return null;
  const barangay = DAGUPAN_PLACE?.barangays.find((item) => item.code === String(barangayCode));
  return barangay ? { place: DAGUPAN_PLACE, barangay } : null;
}

export function resolvePangasinanBarangay(cityCode, barangayCode) {
  const place = PLACE_BY_CODE.get(String(cityCode));
  if (!place) return null;
  const barangay = place.barangays.find((item) => item.code === String(barangayCode));
  return barangay ? { place, barangay } : null;
}

export function formatPangasinanLocation(cityCode, barangayCode, streetLandmark = "") {
  const resolved = resolvePangasinanBarangay(cityCode, barangayCode);
  if (!resolved) return "";
  const { place, barangay } = resolved;
  return [streetLandmark.trim(), `Brgy. ${barangay.name}`, `${place.name}, Pangasinan`].filter(Boolean).join(", ");
}
