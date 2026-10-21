import React, { useEffect, useState } from 'react';
import { api } from '../api';
import Icon from '../components/Icons';
import ReasonModal from '../components/ReasonModal';
import DeletePostModal from '../components/DeletePostModal';

const photo = (u) => (!u ? '' : u.startsWith('/') ? `http://localhost:5173${u}` : u);
const when = (d) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

// Posts that members flagged. Admin either dismisses the report or takes the post down (the poster gets the reason).
export default function ReportedPosts({ onChanged }) {
  const [status, setStatus] = useState('Open');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', bad: false });
  const [asking, setAsking] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const say = (text, bad = false) => { setMessage({ text, bad }); setTimeout(() => setMessage({ text: '', bad: false }), 4000); };

  const load = async (s = status) => {
    setLoading(true);
    try { setReports((await api(`/reports?status=${s}&limit=100`)).reports); } catch (e) { say(e.message, true); } finally { setLoading(false); }
  };
  useEffect(() => { load(status); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [status]);

  const review = async (id, action, reviewNote) => {
    const r = await api(`/reports/${id}/review`, { method: 'PATCH', body: { action, ...(reviewNote ? { reviewNote } : {}) } });
    say(r.message);
    load();
    onChanged?.();
  };
  const dismiss = async (id) => { try { await review(id, 'dismiss'); } catch (e) { say(e.message, true); } };
  const deletePost = async () => {
    const resource = deleting.targetType === 'sighting' ? 'sightings' : 'adoptions';
    await api(`/${resource}/${deleting.targetId}`, { method: 'DELETE' });
    setReports((current) => current.filter((report) => report.targetId !== deleting.targetId));
    say('Post and its related records were permanently deleted.');
    setDeleting(null);
    onChanged?.();
  };

  return (
    <div style={{ textAlign: 'left', width: '100%' }}>
      <h2 className="adm-title">Reported Posts</h2>
      <p className="adm-sub">Posts that members flagged. Dismiss the report if the post is fine, or take the post down and tell the poster why.</p>
      {message.text && <div className={`rp-alert ${message.bad ? 'rp-alert--bad' : 'rp-alert--ok'}`} role="status">{message.text}</div>}

      <div className="adm-tabs" style={{ marginBottom: 16 }}>
        {['Open', 'Actioned', 'Dismissed'].map((s) => <button type="button" key={s} className={`adm-tab${status === s ? ' is-on' : ''}`} onClick={() => setStatus(s)}>{s === 'Actioned' ? 'Taken down' : s}</button>)}
      </div>

      {loading && <p style={{ color: '#64748b' }}>Loading...</p>}
      {!loading && reports.length === 0 && <div className="adm-empty">No {status === 'Actioned' ? 'taken down' : status.toLowerCase()} reports.</div>}

      <div className="adm-list">
        {reports.map((r) => (
          <div className="adm-card" key={r.id}>
            <div className="adm-card__photo">
              {r.post?.image ? <img src={photo(r.post.image)} alt={r.post.title} /> : <div className="adm-nophoto"><Icon name="paw" size={34} /></div>}
              <span className="rp-badge" style={{ position: 'absolute', top: 6, left: 6, background: '#fff', color: '#0f172a' }}>{r.targetType === 'sighting' ? 'Sighting' : 'Foster'}</span>
            </div>
            <div className="adm-card__body">
              <div className="adm-card__row">
                <span className="rp-badge" style={{ background: '#fef3c7', color: '#92400e' }}><Icon name="flag" size={11} /> {r.reason}</span>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{when(r.createdAt)}</span>
              </div>
              {r.post ? (
                <>
                  <h3>{r.post.title}</h3>
                  <p style={{ margin: '0 0 8px', fontSize: 12, color: '#64748b' }}>{r.post.location} · Post status: {r.post.moderationStatus}</p>
                </>
              ) : <h3>This post no longer exists</h3>}
              <div className="adm-info">
                <div><strong>Reported by:</strong> {r.reportedBy?.name || 'Deleted user'} {r.reportedBy?.email && `(${r.reportedBy.email})`}</div>
                {r.details && <div><strong>Details:</strong> {r.details}</div>}
                {r.post?.poster && <div><strong>Posted by:</strong> {r.post.poster.name} | {r.post.poster.phone} | {r.post.poster.email}</div>}
              </div>
              {r.status === 'Open' && (
                <div className="adm-actions">
                  <button type="button" className="rp-btn rp-btn--ghost rp-btn--sm" onClick={() => dismiss(r.id)}>Dismiss report</button>
                  {r.post && r.post.moderationStatus !== 'Rejected' && <button type="button" className="rp-btn rp-btn--solid-danger rp-btn--sm" onClick={() => setAsking(r)}>Take down post</button>}
                  {r.post && <button type="button" className="rp-btn rp-btn--danger rp-btn--sm" onClick={() => setDeleting({ targetId: r.targetId, targetType: r.targetType, name: r.post.title })}><Icon name="trash" size={13} /> Delete permanently</button>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {asking && (
        <ReasonModal title="Take down this post" subtitle="The post disappears from Browse and the poster is told why. The people who reported it are thanked."
          confirmLabel="Take down post" onCancel={() => setAsking(null)}
          onConfirm={async (reason) => { await review(asking.id, 'takedown', reason); setAsking(null); }} />
      )}
      {deleting && <DeletePostModal postName={deleting.name} postType={deleting.targetType === 'sighting' ? 'Sighting report' : 'Foster post'} onCancel={() => setDeleting(null)} onConfirm={deletePost} />}
    </div>
  );
}
