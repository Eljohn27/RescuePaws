import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import ImagePicker from '../components/ImagePicker';
import Icon from '../components/Icons';
import PostLocation, { PLACE_BY_CODE } from '../components/PostLocation';
import { isInDagupan } from '../utils/dagupanLocation';
import { PET_OPTIONS, cleanPetName, petNameProblem, cleanMarkings, markingsProblem, landmarkProblem } from '../utils/validators';
import './Post.css';

const CONDITIONS = ['Appears Healthy', 'Needs Vet Care', 'Trapped or Scared', 'Calm / Eating'];
const SIZES = ['Small', 'Medium', 'Large'];
const realPhoto = (url) => (url && !url.startsWith('data:') ? url : ''); // the API sends a placeholder when there is no photo

const EMPTY = {
  stray: { photoUrl: '', animalType: 'Dog', approximateSize: 'Medium', condition: 'Appears Healthy', cityMunicipalityCode: '', barangayCode: '', streetLandmark: '', latitude: '', longitude: '', keyFeatures: '', notes: '' },
  foster: { photoUrl: '', petName: '', animalType: 'Dog', gender: 'Male', age: '', breed1: '', breed2: '', cityMunicipalityCode: '', barangayCode: '', streetLandmark: '', latitude: '', longitude: '', description: '' },
};

const Req = () => <span className="rp-req" aria-label="required"> *</span>;
const breedsFor = (animal) => (animal === 'Cat' ? PET_OPTIONS.catBreeds : PET_OPTIONS.dogBreeds);

function Choice({ value, options, onChange, label }) {
  return (
    <div className="post__choice" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o} type="button" aria-pressed={value === o} className={value === o ? 'is-on' : ''} onClick={() => onChange(o)}>{o}</button>
      ))}
    </div>
  );
}

export default function Post() {
  const navigate = useNavigate();
  const { kind: editKind, id: editId } = useParams(); // present only when editing: /post/stray/:id or /post/foster/:id
  const editing = !!editId;

  const [kind, setKind] = useState(editKind === 'foster' ? 'foster' : 'stray');
  const [form, setForm] = useState(EMPTY[kind]);
  const [loading, setLoading] = useState(editing);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const patch = (p) => setForm((f) => ({ ...f, ...p }));
  const set = (k) => (v) => patch({ [k]: v });

  const breedList = useMemo(() => breedsFor(form.animalType), [form.animalType]);

  // Editing: load the existing post into the form
  useEffect(() => {
    if (!editing) return;
    api(editKind === 'foster' ? `/adoptions/${editId}` : `/sightings/${editId}`)
      .then((p) => {
        const base = { photoUrl: realPhoto(p.image), animalType: p.animalType, cityMunicipalityCode: p.cityMunicipalityCode || '', barangayCode: p.barangayCode || '', streetLandmark: p.streetLandmark || '', latitude: p.latitude ?? '', longitude: p.longitude ?? '' };
        if (editKind === 'foster') {
          const [b1 = '', b2 = ''] = String(p.breed || '').split(' + ');
          const list = breedsFor(p.animalType);
          setForm({ ...base, petName: p.petName || '', gender: p.gender || 'Male', age: PET_OPTIONS.ages.includes(p.age) ? p.age : '', breed1: list.includes(b1) ? b1 : '', breed2: list.includes(b2) ? b2 : '', description: p.description || '' });
        } else {
          setForm({ ...base, approximateSize: p.approximateSize || 'Medium', condition: p.condition || 'Appears Healthy', keyFeatures: p.keyFeatures || '', notes: p.notes || '' });
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [editing, editKind, editId]);

  const pickKind = (k) => { setKind(k); setForm(EMPTY[k]); setError(''); };
  const pickAnimal = (a) => patch({ animalType: a, ...(kind === 'foster' ? { breed1: '', breed2: '' } : {}) });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const place = PLACE_BY_CODE.get(form.cityMunicipalityCode);
    const barangay = place?.barangays.find((b) => b.code === form.barangayCode);
    const problems = [];
    if (!form.photoUrl) problems.push('Please add a photo.');
    if (kind === 'foster') {
      const n = petNameProblem(form.petName);
      if (n) problems.push(n);
      if (!form.age) problems.push('Choose the pet’s age.');
      if (!form.breed1) problems.push('Choose the pet’s breed.');
      if (form.breed2 && form.breed2 === form.breed1) problems.push('The second breed must be different from the first.');
    } else {
      const m = markingsProblem(form.keyFeatures);
      if (m) problems.push(m);
    }
    if (!place || !barangay) problems.push('Choose one of Dagupan City’s barangays.');
    const l = landmarkProblem(form.streetLandmark);
    if (l) problems.push(l);
    if ((form.latitude === '') !== (form.longitude === '')) problems.push('Choose a point on the Dagupan map, or leave the map pin blank.');
    if (form.latitude !== '' && !isInDagupan(form.latitude, form.longitude)) problems.push('The map pin must be inside the Dagupan map area.');
    if (problems.length) return setError(problems[0]);

    const location = [form.streetLandmark.trim(), `Brgy. ${barangay.name}`, 'Dagupan City, Pangasinan'].filter(Boolean).join(', ');
    if (location.length > 200) return setError('The full location is too long. Shorten the street or landmark.');

    setBusy(true);
    try {
      const base = kind === 'foster' ? '/adoptions' : '/sightings';
      const { breed1, breed2, ...rest } = form;
      const submission = { ...rest, location, ...(kind === 'foster' ? { breed: [breed1, breed2].filter(Boolean).join(' + ') } : {}) };
      // Empty optional fields are left out so the server doesn't complain about them
      const body = Object.fromEntries(Object.entries(submission).filter(([, v]) => v !== '').map(([k, v]) => [k, ['latitude', 'longitude'].includes(k) ? Number(v) : typeof v === 'string' ? v.trim() : v]));
      await api(editing ? `${base}/${editId}` : base, { method: editing ? 'PUT' : 'POST', body });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="post rp-page post--done">
        <div className="post__done-icon"><Icon name="check" size={32} stroke={3} /></div>
        <h2>{editing ? 'Changes saved' : 'Submitted!'}</h2>
        <p>An admin will review your post first. Once it is approved it will appear on Browse, and you will get a notification with the result.</p>
        <div className="post__done-actions">
          <button type="button" className="rp-btn rp-btn--primary" onClick={() => navigate('/profile')}>My posts</button>
          {!editing && <button type="button" className="rp-btn rp-btn--ghost" onClick={() => { setDone(false); setForm(EMPTY[kind]); }}>Post another</button>}
        </div>
      </div>
    );
  }

  const isFoster = kind === 'foster';

  return (
    <div className="post rp-page">
      <h1>{editing ? 'Edit post' : 'Create a post'}</h1>
      <p className="post__lead">{editing ? 'After you save, an admin will review it again.' : 'Every post is reviewed by an admin before it appears on Browse.'}</p>

      {!editing && (
        <div className="post__kinds">
          {[['stray', 'Sighting', 'eye', 'I saw a stray animal'], ['foster', 'Foster', 'home', 'I have a pet that needs a home']].map(([k, name, icon, sub]) => (
            <button key={k} type="button" className={kind === k ? 'is-on' : ''} onClick={() => pickKind(k)} aria-pressed={kind === k}>
              <Icon name={icon === 'eye' ? 'pin' : 'home'} size={22} />
              <strong>{name}</strong>
              <span>{sub}</span>
            </button>
          ))}
        </div>
      )}

      {loading ? <p className="post__lead">Loading...</p> : (
        <form onSubmit={submit} className="post__form" noValidate>
          <p className="rp-hint" style={{ margin: '0 0 12px' }}><span className="rp-req">*</span> Required information</p>
          <div className="rp-field"><ImagePicker label={<>Photo<Req /></>} value={form.photoUrl} onChange={set('photoUrl')} /></div>

          {isFoster && (
            <div className="rp-field">
              <div className="rp-label__row">
                <label className="rp-label" htmlFor="pet-name">Pet name<Req /></label>
                <span className="rp-counter">{form.petName.length}/30</span>
              </div>
              <input id="pet-name" className="rp-input" value={form.petName} onChange={(e) => set('petName')(cleanPetName(e.target.value))} maxLength={30} placeholder="e.g. Bruno (letters only)" autoComplete="off" />
            </div>
          )}

          <div className="rp-field">
            <span className="rp-label">Animal<Req /></span>
            <Choice label="Animal" value={form.animalType} options={['Dog', 'Cat']} onChange={pickAnimal} />
          </div>

          {isFoster ? (
            <>
              <div className="rp-field">
                <span className="rp-label">Gender<Req /></span>
                <Choice label="Gender" value={form.gender} options={['Male', 'Female']} onChange={set('gender')} />
              </div>
              <div className="rp-field">
                <label className="rp-label" htmlFor="pet-age">Age<Req /></label>
                <select id="pet-age" className="rp-input" value={form.age} onChange={(e) => set('age')(e.target.value)}>
                  <option value="">Choose the pet’s age</option>
                  {PET_OPTIONS.ages.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="rp-row">
                <div className="rp-field">
                  <label className="rp-label" htmlFor="pet-breed1">{form.animalType} breed<Req /></label>
                  <select id="pet-breed1" className="rp-input" value={form.breed1} onChange={(e) => patch({ breed1: e.target.value, ...(e.target.value === form.breed2 ? { breed2: '' } : {}) })}>
                    <option value="">Choose a breed</option>
                    {breedList.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="rp-field">
                  <label className="rp-label" htmlFor="pet-breed2">Mixed with <span className="rp-opt">(optional)</span></label>
                  <select id="pet-breed2" className="rp-input" value={form.breed2} onChange={(e) => set('breed2')(e.target.value)} disabled={!form.breed1}>
                    <option value="">No second breed</option>
                    {breedList.filter((b) => b !== form.breed1).map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="rp-field">
                <span className="rp-label">Size<Req /></span>
                <Choice label="Size" value={form.approximateSize} options={SIZES} onChange={set('approximateSize')} />
              </div>
              <div className="rp-field">
                <label className="rp-label" htmlFor="stray-condition">Condition<Req /></label>
                <select id="stray-condition" className="rp-input" value={form.condition} onChange={(e) => set('condition')(e.target.value)}>
                  {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="rp-field">
                <div className="rp-label__row">
                  <label className="rp-label" htmlFor="stray-marks">Color / markings <span className="rp-opt">(optional)</span></label>
                  <span className="rp-counter">{form.keyFeatures.length}/100</span>
                </div>
                <input id="stray-marks" className="rp-input" value={form.keyFeatures} onChange={(e) => set('keyFeatures')(cleanMarkings(e.target.value))} maxLength={100} placeholder="e.g. brown with a white chest" autoComplete="off" />
                <div className="rp-hint">Letters, spaces, commas and hyphens only (no numbers or symbols).</div>
              </div>
            </>
          )}

          <PostLocation value={form} onChange={patch} animalLabel={isFoster ? 'the pet' : 'the animal'} />

          <div className="rp-field">
            <div className="rp-label__row">
              <label className="rp-label" htmlFor="post-notes">{isFoster ? 'About the pet' : 'More details'} <span className="rp-opt">(optional)</span></label>
              <span className="rp-counter">{(isFoster ? form.description : form.notes).length}/{isFoster ? 1500 : 1000}</span>
            </div>
            <textarea id="post-notes" className="rp-input" value={isFoster ? form.description : form.notes} onChange={(e) => set(isFoster ? 'description' : 'notes')(e.target.value)} maxLength={isFoster ? 1500 : 1000} />
          </div>

          {error && <div className="rp-alert rp-alert--bad" role="alert">{error}</div>}

          <button type="submit" className="rp-btn rp-btn--primary rp-btn--block" disabled={busy} style={{ padding: 13, fontSize: 14 }}>
            {busy ? 'Sending...' : editing ? 'Save changes' : 'Submit for approval'}
          </button>
        </form>
      )}
    </div>
  );
}
