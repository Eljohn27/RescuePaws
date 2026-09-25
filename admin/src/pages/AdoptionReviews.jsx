import React, { useEffect, useState } from 'react';
import { api } from '../api';

// Foster posts = pets posted for adoption. Admin approves them before they appear on Browse.
const STYLE = {
  Pending: { text: 'Pending for Approval', color: '#b45309', bg: '#fef3c7' },
  Approved: { text: 'Approved', color: '#0369a1', bg: '#e0f2fe' },
  Adopted: { text: 'Adopted', color: '#15803d', bg: '#dcfce7' },
  Rejected: { text: 'Rejected', color: '#b91c1c', bg: '#fee2e2' },
};

// Photos saved like "/milo.jpg" live on the main website
const photo = (u) => (!u ? '' : u.startsWith('/') ? `http://localhost:5173${u}` : u);
const btn = (bg, color = '#fff', border = 'none') => ({ backgroundColor: bg, color, border, padding: '6px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' });

// Which group a post belongs to
const groupOf = (p) => (p.listingStatus === 'Adopted' ? 'Adopted' : p.moderationStatus === 'Pending for Approval' ? 'Pending' : p.moderationStatus);

export default function AdoptionReviews() {
  const [tab, setTab] = useState('All');
  const [animalFilter, setAnimalFilter] = useState('All Animals');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', bad: false });

  const say = (text, bad = false) => {
    setMessage({ text, bad });
    setTimeout(() => setMessage({ text: '', bad: false }), 3500);
  };

  const load = async () => {
    try {
      const r = await api('/adoptions/admin/all?limit=100');
      setPosts(r.adoptions);
    } catch (e) { say(e.message, true); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const moderate = async (id, moderationStatus) => {
    let reviewNote = '';
    if (moderationStatus === 'Rejected') {
      const reason = window.prompt('Why is this post rejected? (the poster will see it)');
      if (reason === null) return; // cancelled
      reviewNote = reason;
    }
    try {
      await api(`/adoptions/${id}/moderate`, { method: 'PATCH', body: { moderationStatus, reviewNote } });
      say(moderationStatus === 'Approved' ? 'Approved. It is now on Browse and the poster was notified.' : 'Rejected. The poster was notified.');
      load();
    } catch (e) { say(e.message, true); }
  };

  const count = (g) => posts.filter((p) => groupOf(p) === g).length;
  const tabs = [
    { id: 'All', label: `All Posts (${posts.length})` },
    { id: 'Pending', label: `Pending (${count('Pending')})` },
    { id: 'Approved', label: `Approved (${count('Approved')})` },
    { id: 'Adopted', label: `Adopted (${count('Adopted')})` },
    { id: 'Rejected', label: `Rejected (${count('Rejected')})` },
  ];

  const shown = posts.filter((p) => {
    const okTab = tab === 'All' || groupOf(p) === tab;
    const okAnimal = animalFilter === 'All Animals' || (animalFilter === 'Dogs Only' && p.category === 'dog') || (animalFilter === 'Cats Only' && p.category === 'cat');
    return okTab && okAnimal;
  });

  return (
    <div style={{ textAlign: 'left', padding: '10px 0', width: '100%' }}>
      <div style={{ marginBottom: '15px' }}>
        <h2 style={{ margin: '5px 0', fontSize: '22px', color: '#1e293b' }}>Foster Posts</h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
          Approve pets posted for adoption so they appear on Browse. Adopted pets leave Browse but stay here.
        </p>
      </div>

      {message.text && (
        <div style={{ marginBottom: '12px', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', backgroundColor: message.bad ? '#fee2e2' : '#dcfce7', color: message.bad ? '#b91c1c' : '#166534' }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ backgroundColor: tab === t.id ? '#9a3412' : '#f1f5f9', color: tab === t.id ? '#fff' : '#475569', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: tab === t.id ? 'bold' : 'normal' }}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', backgroundColor: '#e2e8f0', padding: '3px', borderRadius: '6px', gap: '2px' }}>
          {['All Animals', 'Dogs Only', 'Cats Only'].map((o) => (
            <button key={o} onClick={() => setAnimalFilter(o)} style={{ backgroundColor: animalFilter === o ? '#fff' : 'transparent', color: animalFilter === o ? '#0f172a' : '#64748b', border: 'none', padding: '5px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: animalFilter === o ? 'bold' : 'normal', cursor: 'pointer' }}>
              {o}
            </button>
          ))}
        </div>
      </div>

      {loading && <p style={{ color: '#64748b' }}>Loading...</p>}
      {!loading && shown.length === 0 && <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b' }}>No posts in this category.</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {shown.map((p) => {
          const g = groupOf(p);
          const st = STYLE[g] || STYLE.Approved;
          const owner = p.owner || {};
          return (
            <div key={p._id} style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', display: 'flex', gap: '15px' }}>
              <div style={{ position: 'relative', width: '160px', height: '140px', minWidth: '160px' }}>
                <img src={photo(p.image)} alt={p.petName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                <span style={{ position: 'absolute', top: '5px', left: '5px', backgroundColor: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>🐾 {p.animalType}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ backgroundColor: st.bg, color: st.color, padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>• {st.text}</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>🕒 {p.time}</span>
                </div>
                <h3 style={{ margin: '0 0 2px 0', fontSize: '16px', color: '#0f172a' }}>{p.petName}</h3>
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748b' }}>
                  📍 {p.location} · {[p.gender, p.age, p.breed].filter(Boolean).join(' · ')}
                </p>
                <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px', fontSize: '12px', marginBottom: '10px', border: '1px solid #f1f5f9' }}>
                  <div style={{ marginBottom: '4px', color: '#475569' }}>
                    <strong>Posted by:</strong> {owner.name || 'Deleted user'} &nbsp;|&nbsp; <strong>Ph:</strong> {owner.phone || '-'} &nbsp;|&nbsp; {owner.email || ''}
                  </div>
                  <div style={{ color: '#334155' }}><strong>About:</strong> {p.description || '-'}</div>
                  {g === 'Rejected' && p.reviewNote && <div style={{ color: '#b91c1c', marginTop: '4px' }}><strong>Reason given:</strong> {p.reviewNote}</div>}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {g === 'Pending' && (
                    <>
                      <button onClick={() => moderate(p._id, 'Approved')} style={btn('#9a3412')}>Approve Post</button>
                      <button onClick={() => moderate(p._id, 'Rejected')} style={btn('#fff', '#b91c1c', '1px solid #fca5a5')}>Reject</button>
                    </>
                  )}
                  {g === 'Approved' && <button onClick={() => moderate(p._id, 'Rejected')} style={btn('#fff', '#b91c1c', '1px solid #fca5a5')}>Take down</button>}
                  {g === 'Rejected' && <button onClick={() => moderate(p._id, 'Approved')} style={btn('#9a3412')}>Approve instead</button>}
                  {g === 'Adopted' && <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 'bold' }}>✓ Adopted</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
