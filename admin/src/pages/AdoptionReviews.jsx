import React, { useEffect, useState } from 'react';
import { api } from '../api';
import Icon from '../components/Icons';
import ReasonModal from '../components/ReasonModal';

// Foster posts = pets posted for adoption. Admin approves them before they appear on Browse.
const STYLE = {
  Pending: { text: 'Pending for Approval', color: '#b45309', bg: '#fef3c7' },
  Approved: { text: 'Approved', color: '#0369a1', bg: '#e0f2fe' },
  Adopted: { text: 'Adopted', color: '#15803d', bg: '#dcfce7' },
  Rejected: { text: 'Rejected', color: '#b91c1c', bg: '#fee2e2' },
};

// Photos saved like "/milo.jpg" live on the main website
const photo = (u) => (!u ? '' : u.startsWith('/') ? `http://localhost:5173${u}` : u);

// Which group a post belongs to
const groupOf = (p) => (p.listingStatus === 'Adopted' ? 'Adopted' : p.moderationStatus === 'Pending for Approval' ? 'Pending' : p.moderationStatus);

export default function AdoptionReviews() {
  const [tab, setTab] = useState('All');
  const [animalFilter, setAnimalFilter] = useState('All Animals');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', bad: false });
  const [asking, setAsking] = useState(null); // { id, takeDown }

  const say = (text, bad = false) => {
    setMessage({ text, bad });
    setTimeout(() => setMessage({ text: '', bad: false }), 4000);
  };

  const load = async () => {
    try {
      const r = await api('/adoptions/admin/all?limit=100');
      setPosts(r.adoptions);
    } catch (e) { say(e.message, true); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const moderate = async (id, moderationStatus, reviewNote) => {
    await api(`/adoptions/${id}/moderate`, { method: 'PATCH', body: { moderationStatus, ...(reviewNote ? { reviewNote } : {}) } });
    say(moderationStatus === 'Approved' ? 'Approved. It is now on Browse and the poster was notified.' : 'Done. The poster received your message.');
    load();
  };
  const approve = async (id) => { try { await moderate(id, 'Approved'); } catch (e) { say(e.message, true); } };

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
    <div style={{ textAlign: 'left', width: '100%' }}>
      <h2 className="adm-title">Foster Posts</h2>
      <p className="adm-sub">Approve pets posted for adoption so they appear on Browse, or take them down with a reason. Adopted pets leave Browse but stay here.</p>

      {message.text && <div className={`rp-alert ${message.bad ? 'rp-alert--bad' : 'rp-alert--ok'}`} role="status">{message.text}</div>}

      <div className="adm-bar">
        <div className="adm-tabs">
          {tabs.map((t) => <button type="button" key={t.id} className={`adm-tab${tab === t.id ? ' is-on' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>)}
        </div>
        <div className="adm-seg">
          {['All Animals', 'Dogs Only', 'Cats Only'].map((o) => <button type="button" key={o} className={animalFilter === o ? 'is-on' : ''} onClick={() => setAnimalFilter(o)}>{o}</button>)}
        </div>
      </div>

      {loading && <p style={{ color: '#64748b' }}>Loading...</p>}
      {!loading && shown.length === 0 && <div className="adm-empty">No posts in this category.</div>}

      <div className="adm-list">
        {shown.map((p) => {
          const g = groupOf(p);
          const st = STYLE[g] || STYLE.Approved;
          const owner = p.owner || {};
          return (
            <div className="adm-card" key={p._id}>
              <div className="adm-card__photo">
                {p.image ? <img src={photo(p.image)} alt={p.petName} /> : <div className="adm-nophoto"><Icon name="paw" size={34} /></div>}
                <span className="rp-badge" style={{ position: 'absolute', top: 6, left: 6, background: '#fff', color: '#0f172a' }}><Icon name="paw" size={11} /> {p.animalType}</span>
              </div>
              <div className="adm-card__body">
                <div className="adm-card__row">
                  <span className="rp-badge" style={{ background: st.bg, color: st.color }}>{st.text}</span>
                  <span style={{ fontSize: 12, color: '#94a3b8', display: 'inline-flex', gap: 5, alignItems: 'center' }}><Icon name="clock" size={13} /> {p.time}</span>
                </div>
                <h3>{p.petName}</h3>
                <p style={{ margin: '0 0 8px', fontSize: 12, color: '#64748b' }}>{p.location} · {[p.gender, p.age, p.breed].filter(Boolean).join(' · ')}</p>
                <div className="adm-info">
                  <div><strong>Posted by:</strong> {owner.name || 'Deleted user'} | <strong>Ph:</strong> {owner.phone || '-'} | {owner.email || ''}</div>
                  <div><strong>About:</strong> {p.description || '-'}</div>
                </div>
                {g === 'Rejected' && p.reviewNote && <div className="adm-note"><strong>Message sent to the poster:</strong> {p.reviewNote}</div>}
                <div className="adm-actions">
                  {g === 'Pending' && (
                    <>
                      <button type="button" className="rp-btn rp-btn--primary rp-btn--sm" onClick={() => approve(p._id)}>Approve Post</button>
                      <button type="button" className="rp-btn rp-btn--danger rp-btn--sm" onClick={() => setAsking({ id: p._id })}>Reject</button>
                    </>
                  )}
                  {g === 'Approved' && <button type="button" className="rp-btn rp-btn--danger rp-btn--sm" onClick={() => setAsking({ id: p._id, takeDown: true })}>Take down</button>}
                  {g === 'Rejected' && <button type="button" className="rp-btn rp-btn--primary rp-btn--sm" onClick={() => approve(p._id)}>Approve instead</button>}
                  {g === 'Adopted' && <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 700 }}>Adopted</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {asking && (
        <ReasonModal
          title={asking.takeDown ? 'Take down this post' : 'Reject this post'}
          subtitle={asking.takeDown ? 'The post disappears from Browse and the poster is told why.' : 'The poster is told why, so they can fix it and try again.'}
          confirmLabel={asking.takeDown ? 'Take down' : 'Reject post'}
          onCancel={() => setAsking(null)}
          onConfirm={async (reason) => { await moderate(asking.id, 'Rejected', reason); setAsking(null); }}
        />
      )}
    </div>
  );
}
