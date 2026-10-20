import { useEffect, useRef } from 'react';
import { GeoJSON, MapContainer, Marker, Polygon, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import pangasinanBoundary from '../data/pangasinanBoundary.json';
import placeData from '../data/pangasinanPlaces.json';
import { DAGUPAN_BOUNDS, isInDagupan } from '../utils/dagupanLocation';

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const boundaryGeometry = pangasinanBoundary.features[0].geometry;
const provinceBounds = L.geoJSON(pangasinanBoundary).getBounds();
const mapBounds = provinceBounds.pad(0.04);
const DEFAULT_CENTER = [16.02, 120.23]; // Lingayen, Pangasinan

// west, north, east, south (used to keep address searches inside the province)
export const PROVINCE_BBOX = [provinceBounds.getWest(), provinceBounds.getNorth(), provinceBounds.getEast(), provinceBounds.getSouth()];

function pointInRing(longitude, latitude, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if ((yi > latitude) !== (yj > latitude) && longitude < ((xj - xi) * (latitude - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// The precise province polygon is shared by map clicks and Browse pins.
export function isInPangasinan(latitude, longitude) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  return boundaryGeometry.coordinates.some((polygon) =>
    pointInRing(lng, lat, polygon[0]) && !polygon.slice(1).some((hole) => pointInRing(lng, lat, hole))
  );
}

function ClickToChoose({ onChoose, onInvalid }) {
  useMapEvents({
    click(event) {
      if (!isInPangasinan(event.latlng.lat, event.latlng.lng)) {
        onInvalid?.();
        return;
      }
      onInvalid?.(false);
      onChoose({ latitude: event.latlng.lat, longitude: event.latlng.lng });
    },
  });
  return null;
}

function Recenter({ latitude, longitude }) {
  const map = useMap();
  useEffect(() => {
    if (isInPangasinan(latitude, longitude)) map.setView([latitude, longitude], Math.max(map.getZoom(), 14));
  }, [latitude, longitude, map]);
  return null;
}

function ProvinceMask() {
  const southWest = mapBounds.getSouthWest();
  const northEast = mapBounds.getNorthEast();
  const outerRing = [
    [southWest.lat, southWest.lng], [southWest.lat, northEast.lng],
    [northEast.lat, northEast.lng], [northEast.lat, southWest.lng], [southWest.lat, southWest.lng],
  ];
  const provinceRings = boundaryGeometry.coordinates.map((polygon) => polygon[0].map(([lng, lat]) => [lat, lng]));
  const mask = [outerRing, ...provinceRings];
  return (
    <>
      <Polygon positions={mask} pathOptions={{ stroke: false, fillColor: '#f1f5f9', fillOpacity: 0.86, interactive: false }} />
      <GeoJSON data={pangasinanBoundary} style={{ color: '#9E4624', weight: 2, fillOpacity: 0.02 }} />
    </>
  );
}

// The pin can be dragged too. Dropping it outside Pangasinan puts it back where it was.
function DraggablePin({ position, onChoose, onInvalid }) {
  const markerRef = useRef(null);
  return (
    <Marker
      position={position}
      icon={markerIcon}
      draggable
      ref={markerRef}
      eventHandlers={{
        dragend() {
          const marker = markerRef.current;
          if (!marker) return;
          const { lat, lng } = marker.getLatLng();
          if (!isInPangasinan(lat, lng)) {
            marker.setLatLng(position);
            onInvalid?.();
            return;
          }
          onInvalid?.(false);
          onChoose({ latitude: lat, longitude: lng });
        },
      }}
    >
      <Popup>Selected Pangasinan location. Drag the pin or click the map to move it.</Popup>
    </Marker>
  );
}

export function LocationPicker({ latitude, longitude, onChoose, onInvalid }) {
  const hasPoint = isInPangasinan(latitude, longitude);
  const center = hasPoint ? [Number(latitude), Number(longitude)] : DEFAULT_CENTER;
  return (
    <MapContainer center={center} zoom={hasPoint ? 14 : 9} minZoom={8} maxBounds={mapBounds} maxBoundsViscosity={1} scrollWheelZoom style={{ height: 300, width: '100%', borderRadius: 12, marginTop: 8, zIndex: 0 }}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ProvinceMask />
      <ClickToChoose onChoose={onChoose} onInvalid={onInvalid} />
      <Recenter latitude={hasPoint ? Number(latitude) : NaN} longitude={hasPoint ? Number(longitude) : NaN} />
      {hasPoint && <DraggablePin position={center} onChoose={onChoose} onInvalid={onInvalid} />}
    </MapContainer>
  );
}

const dagupanMapBounds = L.latLngBounds(
  [DAGUPAN_BOUNDS.south, DAGUPAN_BOUNDS.west],
  [DAGUPAN_BOUNDS.north, DAGUPAN_BOUNDS.east],
);
const DAGUPAN_CENTER = [16.052, 120.345];
const DAGUPAN_MAP_BOUNDS = dagupanMapBounds;
const DAGUPAN_PLACE_DATA = placeData.places.find((place) => place.code === '0105518000');

function DagupanClickToChoose({ onChoose, onInvalid }) {
  useMapEvents({
    click(event) {
      if (!isInDagupan(event.latlng.lat, event.latlng.lng)) {
        onInvalid?.();
        return;
      }
      onInvalid?.(false);
      onChoose({ latitude: event.latlng.lat, longitude: event.latlng.lng });
    },
  });
  return null;
}

function DagupanRecenter({ latitude, longitude }) {
  const map = useMap();
  useEffect(() => {
    if (isInDagupan(latitude, longitude)) map.setView([latitude, longitude], Math.max(map.getZoom(), 14));
  }, [latitude, longitude, map]);
  return null;
}

function DagupanPin({ position, onChoose, onInvalid }) {
  const markerRef = useRef(null);
  return (
    <Marker position={position} icon={markerIcon} draggable ref={markerRef} eventHandlers={{
      dragend() {
        const marker = markerRef.current;
        if (!marker) return;
        const { lat, lng } = marker.getLatLng();
        if (!isInDagupan(lat, lng)) {
          marker.setLatLng(position);
          onInvalid?.();
          return;
        }
        onInvalid?.(false);
        onChoose({ latitude: lat, longitude: lng });
      },
    }}>
      <Popup>Selected Dagupan City location. Drag the pin or click the map to move it.</Popup>
    </Marker>
  );
}

// Dedicated post form map. The map viewport and pin checks stay within the
// Dagupan extent, while form/API validation restricts the location to Dagupan
// and its official barangay codes.
export function DagupanLocationPicker({ latitude, longitude, onChoose, onInvalid }) {
  const hasPoint = isInDagupan(latitude, longitude);
  const center = hasPoint ? [Number(latitude), Number(longitude)] : DAGUPAN_CENTER;
  return (
    <MapContainer center={center} zoom={12} minZoom={11} maxZoom={18} maxBounds={dagupanMapBounds} maxBoundsViscosity={1} scrollWheelZoom style={{ height: 300, width: '100%', borderRadius: 12, marginTop: 8, zIndex: 0 }}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <DagupanClickToChoose onChoose={onChoose} onInvalid={onInvalid} />
      <DagupanRecenter latitude={hasPoint ? Number(latitude) : NaN} longitude={hasPoint ? Number(longitude) : NaN} />
      {hasPoint && <DagupanPin position={center} onChoose={onChoose} onInvalid={onInvalid} />}
    </MapContainer>
  );
}

export default function SightingMap({ sightings }) {
  const located = sightings.flatMap((s) => {
    if (s.kind === 'foster' && !s.availableInDagupan) return [];
    if (s.cityMunicipalityCode && s.cityMunicipalityCode !== '0105518000') return [];
    if (isInDagupan(s.latitude, s.longitude)) return [{ ...s, mapPoint: [Number(s.latitude), Number(s.longitude)] }];
    // Older posts may have a verified Dagupan barangay but no precise pin.
    // Show an approximate pin at that barangay's mapped center.
    if (s.cityMunicipalityCode === '0105518000') {
      const barangay = DAGUPAN_PLACE_DATA?.barangays.find((item) => item.code === s.barangayCode);
      if (barangay && isInDagupan(barangay.latitude, barangay.longitude)) {
        return [{ ...s, mapPoint: [barangay.latitude, barangay.longitude] }];
      }
    }
    return [];
  });
  if (!located.length) return <div style={{ margin: '0 0 20px', padding: 18, border: '1px solid #e2e8f0', borderRadius: 12, color: '#64748b', fontSize: 13 }}>Dagupan City pins will appear when approved posts include a saved location.</div>;
  return (
    <MapContainer center={DAGUPAN_CENTER} zoom={14} minZoom={14} maxZoom={18} maxBounds={DAGUPAN_MAP_BOUNDS} maxBoundsViscosity={1} scrollWheelZoom style={{ height: 360, width: '100%', borderRadius: 12, marginBottom: 22, zIndex: 0 }}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {located.map((s) => <Marker key={`${s.kind || 'stray'}-${s._id}`} position={s.mapPoint} icon={markerIcon}><Popup><strong>{s.title || s.name}</strong><br />{s.location}<br />{s.kind === 'foster' ? 'Foster listing' : 'Sighting'}</Popup></Marker>)}
    </MapContainer>
  );
}
