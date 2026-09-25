import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

const BRAND = '#9E4624';
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const PLACEHOLDER = "data:image/svg+xml;utf8," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='100%' height='100%' fill='#f1f5f9'/><text x='50%' y='58%' font-size='64' text-anchor='middle'>🐾</text></svg>");
const field = { width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit' };
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', margin: '14px 0 6px' };
const when = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// Plain-words status for each kind of item
const LOOK = {
  wait: { bg: '#fef3c7', color: '#92400e' },
  live: { bg: '#e0f2fe', color: '#0369a1' },
  done: { bg: '#dcfce7', color: '#166534' },
  bad: { bg: '#fee2e2', color: '#b91c1c' },
};
const strayStatus = (s) => ({ 'Pending for Approval': ['wait', 'Waiting for admin approval'], Approved: ['live', 'Live on Browse'], Rejected: ['bad', 'Rejected by admin'], Rescued: ['done', 'Rescued 🎉'] }[s.moderationStatus] || ['wait', s.moderationStatus]);
const fosterStatus = (p) => (p.listingStatus === 'Adopted' ? ['done', 'Adopted 🎉'] : { 'Pending for Approval': ['wait', 'Waiting for admin approval'], Approved: ['live', 'Live on Browse'], Rejected: ['bad', 'Rejected by admin'] }[p.moderationStatus] || ['wait', p.moderationStatus]);
const requestStatus = (r) => ({ 'Needs Review': ['wait', 'Waiting for the poster'], Approved: ['done', 'Approved 🎉'], Rejected: ['bad', 'Declined'] }[r.status]);
const proofStatus = (r) => ({ 'Needs Review': ['wait', 'Waiting for admin'], Approved: ['done', 'Approved, stray rescued 🎉'], Rejected: ['bad', 'Rejected'] }[r.status]);

function Row({ img, title, sub, status, note, actions }) {
  const [look, text] = status;
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
      <img src={img || PLACEHOLDER} alt="" style={{ width: '84px', height: '84px', objectFit: 'cover', borderRadius: '10px' }} />
      <div style={{ flex: 1, minWidth: '200px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
          <strong style={{ fontSize: '15px', color: '#0f172a' }}>{title}</strong>
          <span style={{ background: LOOK[look].bg, color: LOOK[look].color, padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', height: 'fit-content' }}>{text}</span>
        </div>
        <div style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 6px' }}>{sub}</div>
        {note && <div style={{ fontSize: '12px', color: '#b91c1c', background: '#fef2f2', padding: '6px 10px', borderRadius: '6px', marginBottom: '6px' }}>Admin's note: {note}</div>}
        {actions && <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>{actions}</div>}
      </div>
    </div>
  );
}

const small = (primary) => ({ background: primary ? BRAND : '#fff', color: primary ? '#fff' : '#b91c1c', border: primary ? 'none' : '1px solid #fca5a5', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' });

export default function Profile({ user, setUser }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('posts'); // posts | requests | settings
  const [data, setData] = useState(null);
  const [me, setMe] = useState({ name: '', phone: '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState({ text: '', bad: false });

  const say = (text, bad = false) => { setMessage({ text, bad }); setTimeout(() => setMessage({ text: '', bad: false }), 4500); };

  const load = () =>
    Promise.all([api('/adoptions/mine'), api('/sightings/mine'), api('/applications/mine'), api('/proofs/mine'), api('/auth/me')])
      .then(([fosters, strays, requests, proofs, profile]) => {
        setData({ fosters, strays, requests, proofs });
        setMe({ name: profile.name || '', phone: profile.phone || '' });
      })
      .catch((e) => say(e.message, true));
  useEffect(() => { load(); }, []);

  const remove = async (kind, id) => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try { await api(kind === 'foster' ? `/adoptions/${id}` : `/sightings/${id}`, { method: 'DELETE' }); say('Post deleted.'); load(); }
    catch (e) { say(e.message, true); }
  };

  const saveProfile = async () => {
    try {
      const u = await api('/users/me', { method: 'PATCH', body: { name: me.name, phone: me.phone } });
      const saved = { ...(JSON.parse(localStorage.getItem('user')) || {}), name: u.name };
      localStorage.setItem('user', JSON.stringify(saved));
      setUser((cur) => ({ ...cur, name: u.name }));
      say('Profile saved.');
    } catch (e) { say(e.message, true); }
  };

  const savePassword = async () => {
    try { await api('/users/me/password', { method: 'PATCH', body: pw }); setPw({ currentPassword: '', newPassword: '' }); say('Password updated.'); }
    catch (e) { say(e.message, true); }
  };

  const tabBtn = (id, name) => (
    <button key={id} onClick={() => setTab(id)} style={{ padding: '8px 18px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: tab === id ? '700' : '500', background: tab === id ? BRAND : '#f1f5f9', color: tab === id ? '#fff' : '#475569' }}>{name}</button>
  );

  const editable = (kind, id, closed) => !closed && <button onClick={() => navigate(`/post/${kind}/${id}`)} style={small(true)}>Edit</button>;
  const stack = { display: 'flex', flexDirection: 'column', gap: '12px' };

  const posts = data ? [
    ...data.fosters.map((p) => ({ k: `f${p._id}`, at: p.createdAt, el: (
      <Row key={`f${p._id}`} img={p.image} title={p.petName} sub={`For adoption · ${p.location} · ${when(p.createdAt)}`} status={fosterStatus(p)} note={p.moderationStatus === 'Rejected' ? p.reviewNote : ''}
        actions={<>{editable('foster', p._id, p.listingStatus === 'Adopted')}{p.listingStatus !== 'Adopted' && <button onClick={() => remove('foster', p._id)} style={small(false)}>Delete</button>}</>} />) })),
    ...data.strays.map((s) => ({ k: `s${s._id}`, at: s.createdAt, el: (
      <Row key={`s${s._id}`} img={s.photoUrl} title={`${s.animalType}${s.keyFeatures ? ` (${s.keyFeatures})` : ''}`} sub={`Stray · ${s.location} · ${when(s.createdAt)}`} status={strayStatus(s)}
        actions={<>{editable('stray', s._id, s.moderationStatus === 'Rescued')}{s.moderationStatus !== 'Rescued' && <button onClick={() => remove('stray', s._id)} style={small(false)}>Delete</button>}</>} />) })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at)) : [];

  const sent = data ? [
    ...data.requests.map((r) => ({ k: `r${r.id}`, at: r.createdAt, el: <Row key={`r${r.id}`} img={r.img} title={`Request to adopt ${r.animal}`} sub={r.date} status={requestStatus(r)} note={r.status === 'Rejected' ? r.reviewNote : ''} /> })),
    ...data.proofs.map((p) => ({ k: `p${p.id}`, at: p.createdAt, el: <Row key={`p${p.id}`} img={p.sighting.image} title={`Proof for the ${p.sighting.animalType.toLowerCase()} at ${p.sighting.location}`} sub={`Sent ${when(p.createdAt)}`} status={proofStatus(p)} note={p.status === 'Rejected' ? p.reviewNote : ''} /> })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at)) : [];

  const empty = (text, cta, to) => (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '30px', textAlign: 'center', color: '#64748b' }}>
      <p style={{ margin: '0 0 12px' }}>{text}</p>
      <button onClick={() => navigate(to)} style={small(true)}>{cta}</button>
    </div>
  );

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '28px 20px 60px', textAlign: 'left', fontFamily: FONT }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: BRAND, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 'bold' }}>{user?.name ? user.name[0].toUpperCase() : '?'}</div>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', color: '#0f172a' }}>{user?.name}</h1>
          <div style={{ fontSize: '13px', color: '#64748b' }}>{user?.email}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {tabBtn('posts', 'My Posts')}{tabBtn('requests', 'My Requests')}{tabBtn('settings', 'Settings')}
      </div>

      {message.text && <div style={{ marginBottom: '14px', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', background: message.bad ? '#fee2e2' : '#dcfce7', color: message.bad ? '#b91c1c' : '#166534' }}>{message.text}</div>}
      {!data && tab !== 'settings' && <p style={{ color: '#64748b' }}>Loading...</p>}

      {data && tab === 'posts' && (posts.length ? <div style={stack}>{posts.map((p) => p.el)}</div> : empty('You have not posted anything yet.', 'Post now', '/post'))}
      {data && tab === 'requests' && (sent.length ? <div style={stack}>{sent.map((p) => p.el)}</div> : empty('You have not sent any requests or proofs yet.', 'Browse', '/browse'))}

      {tab === 'settings' && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>Your details</h3>
          <label style={labelStyle}>Full name</label>
          <input style={field} value={me.name} onChange={(e) => setMe({ ...me, name: e.target.value })} />
          <label style={labelStyle}>Phone (11 digits)</label>
          <input style={field} value={me.phone} onChange={(e) => setMe({ ...me, phone: e.target.value })} />
          <button onClick={saveProfile} style={{ ...small(true), marginTop: '16px', padding: '9px 18px' }}>Save</button>

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '24px 0 4px' }} />
          <h3 style={{ margin: '16px 0 0', fontSize: '16px', color: '#0f172a' }}>Change password</h3>
          <label style={labelStyle}>Current password</label>
          <input type="password" style={field} value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
          <label style={labelStyle}>New password</label>
          <input type="password" style={field} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
          <button onClick={savePassword} disabled={!pw.currentPassword || !pw.newPassword} style={{ ...small(true), marginTop: '16px', padding: '9px 18px', opacity: !pw.currentPassword || !pw.newPassword ? 0.5 : 1 }}>Update password</button>
        </div>
      )}
    </div>
  );
}
