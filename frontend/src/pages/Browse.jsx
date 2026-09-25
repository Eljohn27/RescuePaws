import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import ImagePicker from '../components/ImagePicker';

const BRAND = '#9E4624';
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const field = { width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit' };
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', margin: '12px 0 6px' };
const button = { backgroundColor: BRAND, color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' };
const clamp = { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' };

// One common card shape for both kinds of post
const fromSighting = (s) => ({ key: `s-${s._id}`, kind: 'stray', id: s._id, animal: s.animalType, image: s.image, mine: s.isMine, title: s.name, location: s.location, time: s.time, text: s.description, createdAt: s.createdAt });
const fromAdoption = (p) => ({ key: `a-${p._id}`, kind: 'foster', id: p._id, animal: p.animalType, image: p.image, mine: p.isMine, title: p.petName, location: p.location, time: p.time, text: p.description, createdAt: p.createdAt });

function Modal({ title, subtitle, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: '14px', padding: '22px', width: '100%', maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto', fontFamily: FONT }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>{title}</h3>
            {subtitle && <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: 'transparent', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// FOSTER: request to adopt (goes to the poster)
function RequestForm({ item, user, onDone }) {
  const [f, setF] = useState({ fullName: user?.name || '', phone: '', email: user?.email || '', address: '', notes: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async () => {
    setBusy(true); setError('');
    try {
      await api(`/adoptions/${item.id}/applications`, { method: 'POST', body: f });
      onDone(item, `Request sent to ${item.title}'s poster.`);
    } catch (e) { setError(e.message); setBusy(false); }
  };

  return (
    <>
      <label style={labelStyle}>Full name</label>
      <input style={field} value={f.fullName} onChange={set('fullName')} />
      <label style={labelStyle}>Phone</label>
      <input style={field} value={f.phone} onChange={set('phone')} placeholder="09XX XXX XXXX" />
      <label style={labelStyle}>Email</label>
      <input style={field} value={f.email} onChange={set('email')} />
      <label style={labelStyle}>Address</label>
      <input style={field} value={f.address} onChange={set('address')} />
      <label style={labelStyle}>Message (optional)</label>
      <textarea style={{ ...field, minHeight: '64px' }} value={f.notes} onChange={set('notes')} placeholder="Tell the poster why you'd be a good home." />
      {error && <div style={{ color: '#b91c1c', fontSize: '12px', marginTop: '10px' }}>{error}</div>}
      <button onClick={submit} disabled={busy} style={{ ...button, width: '100%', marginTop: '16px', opacity: busy ? 0.6 : 1 }}>{busy ? 'Sending...' : 'Send Request'}</button>
    </>
  );
}

// STRAY: proof that I adopted it (goes to the admin)
function ProofForm({ item, onDone }) {
  const [photoUrl, setPhotoUrl] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setBusy(true); setError('');
    try {
      await api(`/sightings/${item.id}/proofs`, { method: 'POST', body: { photoUrl, message } });
      onDone(item, 'Proof sent. An admin will review it.');
    } catch (e) { setError(e.message); setBusy(false); }
  };

  const ready = photoUrl && message.trim().length >= 3;
  return (
    <>
      <div style={{ marginTop: '14px' }}><ImagePicker label="Photo of you with the pet" value={photoUrl} onChange={setPhotoUrl} /></div>
      <label style={labelStyle}>Message</label>
      <textarea style={{ ...field, minHeight: '72px' }} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="e.g. I took him home today and he is safe." />
      {error && <div style={{ color: '#b91c1c', fontSize: '12px', marginTop: '10px' }}>{error}</div>}
      <button onClick={submit} disabled={busy || !ready} style={{ ...button, width: '100%', marginTop: '16px', opacity: busy || !ready ? 0.5 : 1 }}>{busy ? 'Sending...' : 'Send Proof'}</button>
    </>
  );
}

export default function Browse({ isLoggedIn, user }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all'); // all | stray | foster
  const [modal, setModal] = useState(null);
  const [sent, setSent] = useState([]); // cards I already sent something for
  const [toast, setToast] = useState('');

  useEffect(() => {
    Promise.all([api('/sightings?limit=100'), api('/adoptions?limit=100')])
      .then(([s, a]) => setItems([...s.map(fromSighting), ...a.map(fromAdoption)].sort((x, y) => new Date(y.createdAt) - new Date(x.createdAt))))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const shown = items.filter((i) => tab === 'all' || i.kind === tab);
  const open = (item) => (isLoggedIn ? setModal(item) : navigate('/login'));
  const done = (item, msg) => {
    setModal(null);
    setSent((s) => [...s, item.key]);
    setToast(msg);
    setTimeout(() => setToast(''), 5000);
  };

  const tabs = [['all', 'All'], ['stray', 'Strays'], ['foster', 'For Adoption']];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 20px 60px', textAlign: 'left', fontFamily: FONT }}>
      <h1 style={{ margin: '0 0 16px', fontSize: '26px', color: '#0f172a' }}>Browse</h1>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '22px' }}>
        {tabs.map(([id, name]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: '8px 18px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: tab === id ? '700' : '500', backgroundColor: tab === id ? BRAND : '#f1f5f9', color: tab === id ? '#fff' : '#475569' }}>{name}</button>
        ))}
      </div>

      {toast && <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '8px', background: '#dcfce7', color: '#166534', fontSize: '13px' }}>{toast}</div>}
      {loading && <p style={{ color: '#64748b' }}>Loading...</p>}
      {error && <p style={{ color: '#b91c1c' }}>Could not load posts. Is the backend running?</p>}
      {!loading && !error && shown.length === 0 && <p style={{ color: '#64748b' }}>Nothing to show yet.</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
        {shown.map((i) => {
          const isStray = i.kind === 'stray';
          const alreadySent = sent.includes(i.key);
          return (
            <div key={i.key} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', height: '190px' }}>
                <img src={i.image} alt={i.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span style={{ position: 'absolute', top: '10px', left: '10px', background: '#fff', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', fontWeight: '700', color: '#0f172a' }}>
                  {isStray ? 'Stray' : 'For adoption'}
                </span>
              </div>
              <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '16px', color: '#0f172a' }}>{i.title}</h3>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>📍 {i.location} · {i.time}</div>
                {i.text && <p style={{ ...clamp, margin: '0 0 14px', fontSize: '13px', color: '#334155', lineHeight: 1.45 }}>{i.text}</p>}
                <div style={{ marginTop: 'auto' }}>
                  {i.mine ? (
                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', textAlign: 'center', padding: '10px 0' }}>Your post</div>
                  ) : (
                    <button onClick={() => open(i)} disabled={alreadySent} style={{ ...button, width: '100%', opacity: alreadySent ? 0.5 : 1, cursor: alreadySent ? 'default' : 'pointer' }}>
                      {alreadySent ? 'Sent ✓' : isStray ? 'Adopted' : 'Request'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <Modal
          title={modal.kind === 'stray' ? 'Proof of adoption' : `Request to adopt ${modal.title}`}
          subtitle={modal.kind === 'stray' ? 'Show the admin that you took in this stray.' : 'Your request goes to the person who posted this pet.'}
          onClose={() => setModal(null)}
        >
          {modal.kind === 'stray' ? <ProofForm item={modal} onDone={done} /> : <RequestForm item={modal} user={user} onDone={done} />}
        </Modal>
      )}
    </div>
  );
}
