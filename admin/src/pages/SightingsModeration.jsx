import React, { useEffect, useState } from 'react';
import { api } from '../api';

const STATUS_STYLE = {
  'Pending for Approval': { color: '#b45309', bg: '#fef3c7' },
  Approved: { color: '#0369a1', bg: '#e0f2fe' },
  Rescued: { color: '#15803d', bg: '#dcfce7' },
  Rejected: { color: '#b91c1c', bg: '#fee2e2' },
};

// Photos saved like "/milo.jpg" live on the main website
const photo = (u) => (!u ? '' : u.startsWith('/') ? `http://localhost:5173${u}` : u);
const when = (d) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

const btn = (bg, color = '#fff', border = 'none') => ({ backgroundColor: bg, color, border, padding: '6px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' });

function Photo({ src, label, size = 140 }) {
  return src ? (
    <img src={photo(src)} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
  ) : (
    <div style={{ width: '100%', height: size, borderRadius: '6px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>🐾</div>
  );
}

export default function SightingsModeration() {
  const [tab, setTab] = useState('All'); // All | Pending | Approved | Rescued | Proofs
  const [animalFilter, setAnimalFilter] = useState('All Animals');
  const [reports, setReports] = useState([]);
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', bad: false });

  const say = (text, bad = false) => {
    setMessage({ text, bad });
    setTimeout(() => setMessage({ text: '', bad: false }), 3500);
  };

  const load = async () => {
    try {
      const [s, p] = await Promise.all([api('/sightings/admin/all?limit=100'), api('/proofs?status=Needs%20Review&limit=100')]);
      setReports(s.sightings);
      setProofs(p.proofs);
    } catch (e) {
      say(e.message, true);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const moderate = async (id, moderationStatus) => {
    try {
      await api(`/sightings/${id}/moderate`, { method: 'PATCH', body: { moderationStatus } });
      say(`Report ${moderationStatus.toLowerCase()}. The poster was notified.`);
      load();
    } catch (e) { say(e.message, true); }
  };

  const reviewProof = async (id, status) => {
    let reviewNote = '';
    if (status === 'Rejected') {
      const reason = window.prompt('Why is the proof rejected? (optional)');
      if (reason === null) return; // cancelled
      reviewNote = reason;
    }
    try {
      await api(`/proofs/${id}/review`, { method: 'PATCH', body: { status, reviewNote } });
      say(status === 'Approved' ? 'Proof approved. The stray is now marked as rescued.' : 'Proof rejected.');
      load();
    } catch (e) { say(e.message, true); }
  };

  const count = (status) => reports.filter((r) => r.moderationStatus === status).length;
  const tabs = [
    { id: 'All', label: `All Reports (${reports.length})` },
    { id: 'Pending', label: `Pending (${count('Pending for Approval')})` },
    { id: 'Approved', label: `Approved (${count('Approved')})` },
    { id: 'Rescued', label: `Rescued (${count('Rescued')})` },
    { id: 'Proofs', label: `Rescue Proofs (${proofs.length})` },
  ];
  const wanted = { Pending: 'Pending for Approval', Approved: 'Approved', Rescued: 'Rescued' }[tab];

  const shown = reports.filter((r) => {
    const okStatus = tab === 'All' || r.moderationStatus === wanted;
    const okAnimal = animalFilter === 'All Animals' || (animalFilter === 'Dogs Only' && r.animalType === 'Dog') || (animalFilter === 'Cats Only' && r.animalType === 'Cat');
    return okStatus && okAnimal;
  });

  return (
    <div style={{ textAlign: 'left', padding: '10px 0', width: '100%' }}>
      <div style={{ marginBottom: '15px' }}>
        <h2 style={{ margin: '5px 0', fontSize: '22px', color: '#1e293b' }}>Sightings Moderation</h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
          Approve reports so they appear on Browse, and review proofs that someone rescued a stray.
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

        {tab !== 'Proofs' && (
          <div style={{ display: 'flex', backgroundColor: '#e2e8f0', padding: '3px', borderRadius: '6px', gap: '2px' }}>
            {['All Animals', 'Dogs Only', 'Cats Only'].map((o) => (
              <button key={o} onClick={() => setAnimalFilter(o)} style={{ backgroundColor: animalFilter === o ? '#fff' : 'transparent', color: animalFilter === o ? '#0f172a' : '#64748b', border: 'none', padding: '5px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: animalFilter === o ? 'bold' : 'normal', cursor: 'pointer' }}>
                {o}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && <p style={{ color: '#64748b' }}>Loading...</p>}

      {/* ---------- RESCUE PROOFS ---------- */}
      {!loading && tab === 'Proofs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {proofs.length === 0 && <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b' }}>No proofs waiting for review.</div>}
          {proofs.map((p) => (
            <div key={p._id} style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ width: '150px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>The stray post</div>
                <div style={{ height: '120px' }}><Photo src={p.sighting.image} label="stray" size={120} /></div>
              </div>
              <div style={{ width: '150px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Proof photo</div>
                <div style={{ height: '120px' }}><Photo src={p.photoUrl} label="proof" size={120} /></div>
              </div>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#0f172a' }}>📍 {p.sighting.animalType} at {p.sighting.location}</h3>
                <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px', fontSize: '12px', marginBottom: '10px', border: '1px solid #f1f5f9', color: '#334155' }}>
                  <div style={{ marginBottom: '4px' }}>
                    <strong>Sent by:</strong> {p.contact ? p.contact.name : p.submittedBy}
                    {p.contact && <> &nbsp;|&nbsp; <strong>Ph:</strong> {p.contact.phone} &nbsp;|&nbsp; {p.contact.email}</>}
                  </div>
                  <div><strong>Message:</strong> {p.message}</div>
                  <div style={{ color: '#94a3b8', marginTop: '4px' }}>{when(p.createdAt)}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => reviewProof(p._id, 'Approved')} style={btn('#047857')}>✓ Approve &amp; mark Rescued</button>
                  <button onClick={() => reviewProof(p._id, 'Rejected')} style={btn('#fff', '#b91c1c', '1px solid #fca5a5')}>Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------- REPORTS ---------- */}
      {!loading && tab !== 'Proofs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {shown.length === 0 && <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b' }}>No reports found in this category.</div>}
          {shown.map((r) => {
            const st = STATUS_STYLE[r.moderationStatus] || STATUS_STYLE.Approved;
            const who = r.reportedBy || {};
            return (
              <div key={r._id} style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', display: 'flex', gap: '15px' }}>
                <div style={{ position: 'relative', width: '160px', height: '140px', minWidth: '160px' }}>
                  <Photo src={r.photoUrl} label={r.animalType} />
                  <span style={{ position: 'absolute', top: '5px', left: '5px', backgroundColor: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>🐾 {r.animalType}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ backgroundColor: st.bg, color: st.color, padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>• {r.moderationStatus}</span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>🕒 {when(r.createdAt)}</span>
                  </div>
                  <h3 style={{ margin: '0 0 2px 0', fontSize: '16px', color: '#0f172a' }}>📍 {r.location}</h3>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748b' }}>Condition: {r.condition} · Size: {r.approximateSize}</p>
                  <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px', fontSize: '12px', marginBottom: '10px', border: '1px solid #f1f5f9' }}>
                    <div style={{ marginBottom: '4px', color: '#475569' }}>
                      <strong>Reported by:</strong> {who.name || 'Deleted user'} &nbsp;|&nbsp; <strong>Ph:</strong> {r.reporterPhone || who.phone || '-'}
                    </div>
                    <div style={{ color: '#334155' }}><strong>Description:</strong> {r.notes || r.keyFeatures || '-'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {r.moderationStatus === 'Pending for Approval' && (
                      <>
                        <button onClick={() => moderate(r._id, 'Approved')} style={btn('#9a3412')}>Approve Report</button>
                        <button onClick={() => moderate(r._id, 'Rejected')} style={btn('#fff', '#b91c1c', '1px solid #fca5a5')}>Reject</button>
                      </>
                    )}
                    {r.moderationStatus === 'Approved' && (
                      <button onClick={() => moderate(r._id, 'Rescued')} style={btn('#047857')}>✓ Mark as Rescued</button>
                    )}
                    {r.moderationStatus === 'Rescued' && <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 'bold' }}>✓ Rescue Completed</span>}
                    {r.moderationStatus === 'Rejected' && <span style={{ fontSize: '12px', color: '#b91c1c' }}>Rejected</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
