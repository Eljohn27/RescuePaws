import React, { useEffect, useState } from 'react';
import { DagupanLocationPicker } from './SightingMap';
import { cleanLandmark, landmarkProblem } from '../utils/validators';
import { DAGUPAN_BARANGAYS, DAGUPAN_CODE, DAGUPAN_PLACE, isInDagupan } from '../utils/dagupanLocation';

export const PLACES = [DAGUPAN_PLACE];
export const PLACE_BY_CODE = new Map([[DAGUPAN_CODE, DAGUPAN_PLACE]]);
const BARANGAY_BY_CODE = new Map(DAGUPAN_BARANGAYS.map((barangay) => [barangay.code, barangay]));
const STREET_MAX = 100;

const nearestBarangay = (lat, lng) => {
  let best = null;
  let bestD = Infinity;
  for (const barangay of DAGUPAN_BARANGAYS) {
    const d = (barangay.latitude - lat) ** 2 + ((barangay.longitude - lng) * Math.cos((lat * Math.PI) / 180)) ** 2;
    if (d < bestD) { bestD = d; best = barangay; }
  }
  return best;
};

const fix = (n) => Number(n).toFixed(6);

export default function PostLocation({ value, onChange, animalLabel = 'the animal' }) {
  const { barangayCode, streetLandmark: street, latitude, longitude } = value;
  const barangay = BARANGAY_BY_CODE.get(barangayCode);
  const [status, setStatus] = useState('');
  const [mapError, setMapError] = useState(false);
  const [streetSuggestions, setStreetSuggestions] = useState([]);

  // Editing an older post may bring a Pangasinan-wide city code; force it into
  // Dagupan and clear any barangay that is not one of Dagupan's 31 barangays.
  useEffect(() => {
    const validBarangay = BARANGAY_BY_CODE.has(value.barangayCode);
    if (value.cityMunicipalityCode !== DAGUPAN_CODE || (!validBarangay && value.barangayCode)) {
      onChange({ cityMunicipalityCode: DAGUPAN_CODE, barangayCode: '', latitude: '', longitude: '' });
    } else if (!value.cityMunicipalityCode) {
      onChange({ cityMunicipalityCode: DAGUPAN_CODE });
    }
    // Only normalize when the form's location is loaded or changed externally.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.cityMunicipalityCode, value.barangayCode]);

  // OSM suggestions are scoped to the chosen barangay. Coverage varies, so
  // users can still type any street or landmark when a mapped street is absent.
  useEffect(() => {
    const query = (street || '').trim();
    if (!barangay || query.length < 3) {
      setStreetSuggestions([]);
      return undefined;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          format: 'jsonv2', addressdetails: '1', limit: '8', countrycodes: 'ph', bounded: '1',
          viewbox: '120.377899,16.108713,120.29875,16.008933',
          q: `${query}, ${barangay.name}, Dagupan City, Pangasinan, Philippines`,
        });
        const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        const rows = await response.json();
        const names = Array.isArray(rows)
          ? rows.map((row) => row.address?.road || row.address?.pedestrian || row.name).filter(Boolean)
          : [];
        setStreetSuggestions([...new Set(names)].slice(0, 8));
      } catch (error) {
        if (error.name !== 'AbortError') setStreetSuggestions([]);
      }
    }, 900);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [street, barangay]);

  const onBarangay = (code) => {
    const selected = BARANGAY_BY_CODE.get(code);
    setMapError(false);
    setStatus('');
    onChange({
      cityMunicipalityCode: DAGUPAN_CODE,
      barangayCode: code,
      ...(selected ? { latitude: fix(selected.latitude), longitude: fix(selected.longitude) } : { latitude: '', longitude: '' }),
    });
  };

  const onMapChoose = ({ latitude: lat, longitude: lng }) => {
    const selected = nearestBarangay(lat, lng);
    if (!selected) return;
    setMapError(false);
    onChange({ cityMunicipalityCode: DAGUPAN_CODE, barangayCode: selected.code, latitude: fix(lat), longitude: fix(lng) });
    setStatus(`Location set to Brgy. ${selected.name}, Dagupan City.`);
  };

  const streetIssue = landmarkProblem(street || '');
  const hasPin = isInDagupan(latitude, longitude);

  return (
    <>
      <div className="rp-field">
        <span className="rp-label">City or municipality where {animalLabel} is <span className="rp-req">*</span></span>
        <div className="rp-input" aria-label="City or municipality" style={{ display: 'flex', alignItems: 'center' }}>Dagupan City</div>
        <input type="hidden" name="cityMunicipalityCode" value={DAGUPAN_CODE} />
      </div>

      <div className="rp-field">
        <label className="rp-label" htmlFor="loc-brgy">Barangay <span className="rp-req">*</span></label>
        <select id="loc-brgy" className="rp-input" value={barangayCode || ''} onChange={(e) => onBarangay(e.target.value)} required>
          <option value="">Choose a Dagupan City barangay</option>
          {DAGUPAN_BARANGAYS.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
        </select>
      </div>

      <div className="rp-field">
        <div className="rp-label__row">
          <label className="rp-label" htmlFor="loc-street">Street or landmark <span className="rp-opt">(optional)</span></label>
          <span className={`rp-counter${(street || '').length >= STREET_MAX ? ' rp-counter--full' : ''}`}>{(street || '').length}/{STREET_MAX}</span>
        </div>
        <input id="loc-street" className="rp-input" list="dagupan-street-suggestions" value={street || ''} onChange={(e) => onChange({ streetLandmark: cleanLandmark(e.target.value) })} maxLength={STREET_MAX} placeholder="Search a street or enter a landmark" disabled={!barangay} />
        <datalist id="dagupan-street-suggestions">{streetSuggestions.map((name) => <option key={name} value={name} />)}</datalist>
        {streetIssue ? <div className="rp-error">{streetIssue}</div> : <div className="rp-hint">{barangay ? 'Suggestions use mapped streets for this barangay; if one is missing, type the street or a nearby landmark.' : 'Choose a barangay first.'}</div>}
      </div>

      <div className="rp-field">
        <span className="rp-label">Pin on the Dagupan map <span className="rp-opt">(optional)</span></span>
        <p className="rp-hint" style={{ margin: '0 0 4px' }}>Choose a Dagupan barangay, then click or drag the pin to refine the location.</p>
        <DagupanLocationPicker
          latitude={latitude === '' ? null : Number(latitude)}
          longitude={longitude === '' ? null : Number(longitude)}
          onInvalid={(valid) => setMapError(valid !== false)}
          onChoose={onMapChoose}
        />
        {mapError && <div className="rp-error" role="alert">Choose a point inside the Dagupan map area.</div>}
        {status && <div className="rp-hint" role="status" style={{ marginTop: 8, fontSize: 12 }}>{status}</div>}
        {hasPin && <div className="rp-hint">Pin: {Number(latitude).toFixed(5)}, {Number(longitude).toFixed(5)}</div>}
      </div>
    </>
  );
}
