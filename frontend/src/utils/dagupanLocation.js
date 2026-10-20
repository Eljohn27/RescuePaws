import placeData from '../data/pangasinanPlaces.json';

export const DAGUPAN_CODE = '0105518000';
export const DAGUPAN_PLACE = placeData.places.find((place) => place.code === DAGUPAN_CODE);
export const DAGUPAN_BARANGAYS = DAGUPAN_PLACE?.barangays ?? [];

// Dagupan-only map extent based on the available official barangay centroid set.
// City and barangay codes are checked separately, so all submitted addresses
// still have to resolve to an official Dagupan barangay.
export const DAGUPAN_BOUNDS = { south: 16.008933, north: 16.108713, west: 120.29875, east: 120.377899 };

export function isInDagupan(latitude, longitude) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  return Number.isFinite(lat) && Number.isFinite(lng)
    && lat >= DAGUPAN_BOUNDS.south && lat <= DAGUPAN_BOUNDS.north
    && lng >= DAGUPAN_BOUNDS.west && lng <= DAGUPAN_BOUNDS.east;
}
