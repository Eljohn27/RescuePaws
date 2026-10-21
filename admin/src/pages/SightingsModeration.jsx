import React, { useEffect, useState } from 'react';
import { api } from '../api';
import Icon from '../components/Icons';
import ReasonModal from '../components/ReasonModal';
import DeletePostModal from '../components/DeletePostModal';

const STATUS_STYLE = {
  'Pending for Approval': { color: '#b45309', bg: '#fef3c7' },
  Approved: { color: '#0369a1', bg: '#e0f2fe' },
  Rescued: { color: '#15803d', bg: '#dcfce7' },
  Rejected: { color: '#b91c1c', bg: '#fee2e2' },
};

// Photos saved like "/milo.jpg" live on the main website
const photo = (u) => (!u ? '' : u.startsWith('/') ? `http://localhost:5173${u}` : u);
const when = (d) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

function Photo({ src, label }) {
  return src ? <img src={photo(src)} alt={label} /> : <div className="adm-nophoto"><Icon name="paw" size={34} /></div>;
}

export default function SightingsModeration({ initialTab = 'All' }) {
  const [tab, setTab] = useState(initialTab); // All | Pending | Approved | Rescued | Rejected | Proofs
  const [animalFilter, setAnimalFilter] = useState('All Animals');
  const [reports, setReports] = useState([]);
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', bad: false });
  const [asking, setAsking] = useState(null); // { kind: 'report' | 'proof', id, takeDown? }
  const [deleting, setDeleting] = useState(null);

  const say = (text, bad = false) => {
    setMessage({ text, bad });
    setTimeout(() => setMessage({ text: '', bad: false }), 4000);
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

  const moderate = async (id, moderationStatus, reviewNote) => {
    await api(`/sightings/${id}/moderate`, { method: 'PATCH', body: { moderationStatus, ...(reviewNote ? { reviewNote } : {}) } });
    say(moderationStatus === 'Rejected' ? 'Done. The reporter received your message.' : `Report ${moderationStatus.toLowerCase()}. The reporter was notified.`);
    load();
  };
  const approveOrRescue = async (id, status) => { try { await moderate(id, status); } catch (e) { say(e.message, true); } };

  const reviewProof = async (id, status, reviewNote) => {
    await api(`/proofs/${id}/review`, { method: 'PATCH', body: { status, ...(reviewNote ? { reviewNote } : {}) } });
    say(status === 'Approved' ? 'Proof approved. The stray is now marked as rescued.' : 'Proof rejected. The person received your message.');
    load();
  };
  const approveProof = async (id) => { try { await reviewProof(id, 'Approved'); } catch (e) { say(e.message, true); } };
  const deletePost = async () => {
    await api(`/sightings/${deleting.id}`, { method: 'DELETE' });
    setReports((current) => current.filter((report) => report._id !== deleting.id));
    say('Sighting post and its related records were permanently deleted.');
    setDeleting(null);
  };

  const count = (status) => reports.filter((r) => r.moderationStatus === status).length;
  const tabs = [
    { id: 'All', label: `All Reports (${reports.length})` },
    { id: 'Pending', label: `Pending (${count('Pending for Approval')})` },
    { id: 'Approved', label: `Approved (${count('Approved')})` },
    { id: 'Rescued', label: `Rescued (${count('Rescued')})` },
    { id: 'Rejected', label: `Rejected (${count('Rejected')})` },
    { id: 'Proofs', label: `Rescue Proofs (${proofs.length})` },
  ];
  const wanted = { Pending: 'Pending for Approval', Approved: 'Approved', Rescued: 'Rescued', Rejected: 'Rejected' }[tab];

  const shown = reports.filter((r) => {
    const okStatus = tab === 'All' || r.moderationStatus === wanted;
    const okAnimal = animalFilter === 'All Animals' || (animalFilter === 'Dogs Only' && r.animalType === 'Dog') || (animalFilter === 'Cats Only' && r.animalType === 'Cat');
    return okStatus && okAnimal;
  });

  return (
    <div style={{ textAlign: 'left', width: '100%' }}>
      <h2 className="adm-title">Sightings Moderation</h2>
      <p className="adm-sub">Approve reports so they appear on Browse, take down posts that break the rules, and review proofs that someone rescued a stray.</p>

      {message.text && <div className={`rp-alert ${message.bad ? 'rp-alert--bad' : 'rp-alert--ok'}`} role="status">{message.text}</div>}

      <div className="adm-bar">
        <div className="adm-tabs">
          {tabs.map((t) => <button type="button" key={t.id} className={`adm-tab${tab === t.id ? ' is-on' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>)}
        </div>
        {tab !== 'Proofs' && (
          <div className="adm-seg">
            {['All Animals', 'Dogs Only', 'Cats Only'].map((o) => <button type="button" key={o} className={animalFilter === o ? 'is-on' : ''} onClick={() => setAnimalFilter(o)}>{o}</button>)}
          </div>
        )}
      </div>

      {loading && <p style={{ color: '#64748b' }}>Loading...</p>}

      {!loading && tab === 'Proofs' && (
        <div className="adm-list">
          {proofs.length === 0 && <div className="adm-empty">No proofs waiting for review.</div>}
          {proofs.map((p) => (
            <div className="adm-card" key={p._id}>
              <div style={{ width: 150 }}><div className="rp-hint" style={{ marginTop: 0, marginBottom: 4 }}>The stray post</div><div className="adm-card__photo" style={{ width: 150, height: 120 }}><Photo src={p.sighting.image} label="stray" /></div></div>
              <div style={{ width: 150 }}><div className="rp-hint" style={{ marginTop: 0, marginBottom: 4 }}>Proof photo</div><div className="adm-card__photo" style={{ width: 150, height: 120 }}><Photo src={p.photoUrl} label="proof" /></div></div>
              <div className="adm-card__body">
                <h3><Icon name="pin" size={16} style={{ marginTop: 3, color: '#9a3412' }} /> {p.sighting.animalType} at {p.sighting.location}</h3>
                <div className="adm-info">
                  <div><strong>Sent by:</strong> {p.contact ? p.contact.name : p.submittedBy}{p.contact && <> | <strong>Ph:</strong> {p.contact.phone} | {p.contact.email}</>}</div>
                  <div><strong>Message:</strong> {p.message}</div>
                  <div style={{ color: '#94a3b8' }}>{when(p.createdAt)}</div>
                </div>
                <div className="adm-actions">
                  <button type="button" className="rp-btn rp-btn--ok rp-btn--sm" onClick={() => approveProof(p._id)}><Icon name="check" size={13} stroke={3} /> Approve and mark Rescued</button>
                  <button type="button" className="rp-btn rp-btn--danger rp-btn--sm" onClick={() => setAsking({ kind: 'proof', id: p._id })}>Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && tab !== 'Proofs' && (
        <div className="adm-list">
          {shown.length === 0 && <div className="adm-empty">No reports found in this category.</div>}
          {shown.map((r) => {
            const st = STATUS_STYLE[r.moderationStatus] || STATUS_STYLE.Approved;
            const who = r.reportedBy || {};
            return (
              <div className="adm-card" key={r._id}>
                <div className="adm-card__photo">
                  <Photo src={r.photoUrl} label={r.animalType} />
                  <span className="rp-badge" style={{ position: 'absolute', top: 6, left: 6, background: '#fff', color: '#0f172a' }}><Icon name="paw" size={11} /> {r.animalType}</span>
                </div>
                <div className="adm-card__body">
                  <div className="adm-card__row">
                    <span className="rp-badge" style={{ background: st.bg, color: st.color }}>{r.moderationStatus}</span>
                    <span style={{ fontSize: 12, color: '#94a3b8', display: 'inline-flex', gap: 5, alignItems: 'center' }}><Icon name="clock" size={13} /> {when(r.createdAt)}</span>
                  </div>
                  <h3><Icon name="pin" size={16} style={{ marginTop: 3, color: '#9a3412' }} /> {r.location}</h3>
                  <p style={{ margin: '0 0 8px', fontSize: 12, color: '#64748b' }}>Condition: {r.condition} · Size: {r.approximateSize}</p>
                  <div className="adm-info">
                    <div><strong>Reported by:</strong> {who.name || 'Deleted user'} | <strong>Ph:</strong> {r.reporterPhone || who.phone || '-'}</div>
                    <div><strong>Description:</strong> {r.notes || r.keyFeatures || '-'}</div>
                  </div>
                  {r.moderationStatus === 'Rejected' && r.reviewNote && <div className="adm-note"><strong>Message sent to the reporter:</strong> {r.reviewNote}</div>}
                  <div className="adm-actions">
                    {r.moderationStatus === 'Pending for Approval' && (
                      <>
                        <button type="button" className="rp-btn rp-btn--primary rp-btn--sm" onClick={() => approveOrRescue(r._id, 'Approved')}>Approve Report</button>
                        <button type="button" className="rp-btn rp-btn--danger rp-btn--sm" onClick={() => setAsking({ kind: 'report', id: r._id })}>Reject</button>
                      </>
                    )}
                    {r.moderationStatus === 'Approved' && (
                      <>
                        <button type="button" className="rp-btn rp-btn--ok rp-btn--sm" onClick={() => approveOrRescue(r._id, 'Rescued')}><Icon name="check" size={13} stroke={3} /> Mark as Rescued</button>
                        <button type="button" className="rp-btn rp-btn--danger rp-btn--sm" onClick={() => setAsking({ kind: 'report', id: r._id, takeDown: true })}>Take down</button>
                      </>
                    )}
                    {r.moderationStatus === 'Rescued' && <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 700 }}>Rescue completed</span>}
                    <button type="button" className="rp-btn rp-btn--danger rp-btn--sm" onClick={() => setDeleting({ id: r._id, name: `${r.animalType || 'Animal'} sighting` })}><Icon name="trash" size={13} /> Delete permanently</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {asking && (
        <ReasonModal
          title={asking.kind === 'proof' ? 'Reject this proof' : asking.takeDown ? 'Take down this report' : 'Reject this report'}
          subtitle={asking.takeDown ? 'The report disappears from Browse and the reporter is told why.' : 'The reporter is told why, so they can fix it and try again.'}
          confirmLabel={asking.kind === 'proof' ? 'Reject proof' : asking.takeDown ? 'Take down' : 'Reject report'}
          onCancel={() => setAsking(null)}
          onConfirm={async (reason) => {
            if (asking.kind === 'proof') await reviewProof(asking.id, 'Rejected', reason);
            else await moderate(asking.id, 'Rejected', reason);
            setAsking(null);
          }}
        />
      )}
      {deleting && <DeletePostModal postName={deleting.name} postType="Sighting report" onCancel={() => setDeleting(null)} onConfirm={deletePost} />}
    </div>
  );
}
