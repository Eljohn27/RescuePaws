import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import ImagePicker from '../components/ImagePicker';

const BRAND = '#9E4624';
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const field = { width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit', background: '#fff' };
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', margin: '16px 0 6px' };
const CONDITIONS = ['Appears Healthy', 'Needs Vet Care', 'Trapped or Scared', 'Calm / Eating'];
const SIZES = ['Small', 'Medium', 'Large'];

const EMPTY = {
  stray: { photoUrl: '', animalType: 'Dog', approximateSize: 'Medium', condition: 'Appears Healthy', location: '', keyFeatures: '', notes: '' },
  foster: { photoUrl: '', petName: '', animalType: 'Dog', gender: 'Male', age: '', breed: '', location: '', description: '' },
};
const realPhoto = (url) => (url && !url.startsWith('data:') ? url : ''); // the API sends a placeholder when there is no photo

function Choice({ value, options, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {options.map((o) => (
        <button key={o} type="button" onClick={() => onChange(o)} style={{ flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', border: value === o ? `2px solid ${BRAND}` : '1px solid #cbd5e1', background: value === o ? '#fff7ed' : '#fff', color: value === o ? BRAND : '#475569' }}>{o}</button>
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
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const text = (k) => (e) => set(k)(e.target.value);

  // Editing: load the existing post into the form
  useEffect(() => {
    if (!editing) return;
    api(editKind === 'foster' ? `/adoptions/${editId}` : `/sightings/${editId}`)
      .then((p) =>
        setForm(
          editKind === 'foster'
            ? { photoUrl: realPhoto(p.image), petName: p.petName || '', animalType: p.animalType, gender: p.gender || 'Male', age: p.age || '', breed: p.breed || '', location: p.location || '', description: p.description || '' }
            : { photoUrl: realPhoto(p.image), animalType: p.animalType, approximateSize: p.approximateSize || 'Medium', condition: p.condition || 'Appears Healthy', location: p.location || '', keyFeatures: p.keyFeatures || '', notes: p.notes || '' }
        )
      )
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [editing, editKind, editId]);

  const pickKind = (k) => { setKind(k); setForm(EMPTY[k]); setError(''); };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.photoUrl) return setError('Please add a photo.');
    setBusy(true);
    try {
      const base = kind === 'foster' ? '/adoptions' : '/sightings';
      // Empty optional fields are left out so the server doesn't complain about them
      const body = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ''));
      await api(editing ? `${base}/${editId}` : base, { method: editing ? 'PUT' : 'POST', body });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const wrap = { maxWidth: '560px', margin: '0 auto', padding: '28px 20px 60px', textAlign: 'left', fontFamily: FONT };

  if (done) {
    return (
      <div style={{ ...wrap, textAlign: 'center' }}>
        <div style={{ fontSize: '44px' }}>✅</div>
        <h2 style={{ color: '#0f172a', margin: '10px 0 6px' }}>{editing ? 'Changes saved' : 'Submitted!'}</h2>
        <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.5 }}>
          An admin will review your post first. Once it is approved it will appear on Browse, and you will see the result on your profile.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
          <button onClick={() => navigate('/profile')} style={{ background: BRAND, color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>My posts</button>
          {!editing && <button onClick={() => { setDone(false); setForm(EMPTY[kind]); }} style={{ background: '#fff', color: '#475569', border: '1px solid #cbd5e1', padding: '10px 18px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Post another</button>}
        </div>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <h1 style={{ margin: '0 0 4px', fontSize: '26px', color: '#0f172a' }}>{editing ? 'Edit post' : 'Post'}</h1>
      <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>{editing ? 'After you save, an admin will review it again.' : 'Every post is reviewed by an admin before it appears on Browse.'}</p>

      {!editing && (
        <div style={{ display: 'flex', gap: '10px', margin: '20px 0 0' }}>
          {[['stray', 'Sighting'], ['foster', 'Foster']].map(([k, icon, name]) => (
            <button key={k} type="button" onClick={() => pickKind(k)} style={{ flex: 1, padding: '14px 10px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', border: kind === k ? `2px solid ${BRAND}` : '1px solid #e2e8f0', background: kind === k ? '#fff7ed' : '#fff', color: kind === k ? BRAND : '#475569' }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>{icon}</div>{name}
            </button>
          ))}
        </div>
      )}

      {loading ? <p style={{ color: '#64748b', marginTop: '20px' }}>Loading...</p> : (
        <form onSubmit={submit}>
          <div style={{ marginTop: '18px' }}><ImagePicker label="Photo" value={form.photoUrl} onChange={set('photoUrl')} /></div>

          {kind === 'foster' && (
            <>
              <label style={labelStyle}>Pet name</label>
              <input style={field} value={form.petName} onChange={text('petName')} required maxLength={60} />
            </>
          )}

          <label style={labelStyle}>Animal</label>
          <Choice value={form.animalType} options={['Dog', 'Cat']} onChange={set('animalType')} />

          {kind === 'foster' ? (
            <>
              <label style={labelStyle}>Gender</label>
              <Choice value={form.gender} options={['Male', 'Female']} onChange={set('gender')} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Age (optional)</label>
                  <input style={field} value={form.age} onChange={text('age')} placeholder="e.g. 2 years" maxLength={40} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Breed (optional)</label>
                  <input style={field} value={form.breed} onChange={text('breed')} placeholder="e.g. Aspin" maxLength={100} />
                </div>
              </div>
            </>
          ) : (
            <>
              <label style={labelStyle}>Size</label>
              <Choice value={form.approximateSize} options={SIZES} onChange={set('approximateSize')} />
              <label style={labelStyle}>Condition</label>
              <select style={field} value={form.condition} onChange={text('condition')}>
                {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
              </select>
              <label style={labelStyle}>Color / markings (optional)</label>
              <input style={field} value={form.keyFeatures} onChange={text('keyFeatures')} placeholder="e.g. brown with a white chest" maxLength={200} />
            </>
          )}

          <label style={labelStyle}>{kind === 'foster' ? 'Where is the pet?' : 'Where did you see it?'}</label>
          <input style={field} value={form.location} onChange={text('location')} required minLength={2} maxLength={200} placeholder="Street, barangay or landmark" />

          <label style={labelStyle}>{kind === 'foster' ? 'About the pet (optional)' : 'More details (optional)'}</label>
          <textarea style={{ ...field, minHeight: '84px' }} value={kind === 'foster' ? form.description : form.notes} onChange={text(kind === 'foster' ? 'description' : 'notes')} maxLength={kind === 'foster' ? 1500 : 1000} />

          {error && <div style={{ color: '#b91c1c', background: '#fee2e2', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginTop: '16px' }}>{error}</div>}

          <button type="submit" disabled={busy} style={{ width: '100%', marginTop: '20px', background: BRAND, color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.6 : 1 }}>
            {busy ? 'Sending...' : editing ? 'Save changes' : 'Submit for approval'}
          </button>
        </form>
      )}
    </div>
  );
}
