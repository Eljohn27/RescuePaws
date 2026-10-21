import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, pingNotifications } from '../api';
import Icon from '../components/Icons';
import Modal from '../components/Modal';
import './Notifications.css';

const POLL_MS = 10000;
const ICON = { Adoption: 'heart', Sightings: 'pin', Reports: 'flag', Messages: 'mail', System: 'info' };
const STATUS = {
  'Needs Review': { text: 'Waiting for you', bg: '#fef3c7', color: '#92400e' },
  Approved: { text: 'Approved, pet adopted', bg: '#dcfce7', color: '#166534' },
  Rejected: { text: 'Declined', bg: '#fee2e2', color: '#b91c1c' },
};

// Everything that happens to me: admin decisions on my posts, adoption requests, reports. It refreshes by itself.
export default function Notifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [answering, setAnswering] = useState(null); // { request, status }
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const alive = useRef(true);
  const first = useRef(true);

  const say = (msg, bad = false) => { setToast({ msg, bad }); setTimeout(() => setToast(null), 5000); };

  const load = useCallback(async () => {
    try {
      const [n, r] = await Promise.all([api('/notifications'), api('/applications/received')]);
      if (!alive.current) return;
      setItems(n.notifications);
      setRequests(r);
    } catch (e) { if (alive.current && first.current) say(e.message, true); } finally { first.current = false; if (alive.current) setLoading(false); }
  }, []);

  useEffect(() => {
    alive.current = true;
    load();
    const timer = setInterval(load, POLL_MS);
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => { alive.current = false; clearInterval(timer); window.removeEventListener('focus', onFocus); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unread = items.filter((i) => i.unread).length;

  const readOne = async (n) => {
    if (!n.unread) return;
    setItems((list) => list.map((i) => (i._id === n._id ? { ...i, unread: false } : i)));
    try { await api(`/notifications/${n._id}/read`, { method: 'PATCH' }); } catch { /* the next refresh corrects it */ }
    pingNotifications();
  };

  const readAll = async () => {
    setItems((list) => list.map((i) => ({ ...i, unread: false })));
    try { await api('/notifications/read-all', { method: 'PATCH' }); } catch (e) { say(e.message, true); }
    pingNotifications();
  };

  const confirmAnswer = async () => {
    const { request, status } = answering;
    setBusy(true);
    try {
      await api(`/applications/${request.id}/review`, { method: 'PATCH', body: { status, reviewNote: status === 'Rejected' ? reason.trim() : '' } });
      say(status === 'Approved' ? `${request.animal} is now marked as adopted. Congratulations!` : 'Request declined. The adopter was notified.');
      setAnswering(null); setReason('');
      await load();
      pingNotifications();
    } catch (e) { say(e.message, true); } finally { setBusy(false); }
  };

  const waiting = requests.filter((r) => r.status === 'Needs Review');
  const shown = tab === 'unread' ? items.filter((i) => i.unread) : items;

  return (
    <div className="nt rp-page">
      <div className="nt__top">
        <div>
          <h1>Notifications</h1>
          <p>Updates on your posts, adoption requests and reports.</p>
        </div>
        <button type="button" className="rp-btn rp-btn--ghost rp-btn--sm" onClick={readAll} disabled={!unread}><Icon name="check" size={14} stroke={3} /> Mark all as read</button>
      </div>

      {loading && <p style={{ color: '#64748b' }}>Loading...</p>}

      {waiting.length > 0 && (
        <>
          <h2 className="nt__h">Adoption requests waiting for you ({waiting.length})</h2>
          <div className="nt__list">
            {waiting.map((r) => {
              const st = STATUS[r.status];
              const d = r.details || {};
              return (
                <div className="nt__req" key={r.id}>
                  <img src={r.img} alt={r.animal} />
                  <div className="nt__req-body">
                    <div className="nt__req-head">
                      <strong>{r.applicant} wants to adopt {r.animal}</strong>
                      <span className="rp-badge" style={{ background: st.bg, color: st.color }}>{st.text}</span>
                    </div>
                    <div className="rp-hint">{r.date}</div>
                    <div className="nt__req-info">
                      <div>Phone: {r.contact.phone}</div>
                      <div>Email: {r.contact.email}</div>
                      <div>Address: {r.contact.address}</div>
                      {d.notesToFoster && <div>Message: {d.notesToFoster}</div>}
                    </div>
                    <div className="nt__req-actions">
                      <button type="button" className="rp-btn rp-btn--ok rp-btn--sm" onClick={() => setAnswering({ request: r, status: 'Approved' })}><Icon name="check" size={14} stroke={3} /> Approve adoption</button>
                      <button type="button" className="rp-btn rp-btn--danger rp-btn--sm" onClick={() => { setReason(''); setAnswering({ request: r, status: 'Rejected' }); }}>Decline</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <h2 className="nt__h">Activity</h2>
      <div className="nt__tabs">
        <button type="button" className={`nt__tab${tab === 'all' ? ' is-on' : ''}`} onClick={() => setTab('all')}>All<small>{items.length}</small></button>
        <button type="button" className={`nt__tab${tab === 'unread' ? ' is-on' : ''}`} onClick={() => setTab('unread')}>Unread<small>{unread}</small></button>
      </div>

      {!loading && shown.length === 0 && (
        <div className="nt__empty">
          <Icon name="bell" size={30} />
          <p style={{ margin: '10px 0 14px' }}>{tab === 'unread' ? 'You are all caught up.' : 'Nothing here yet. Updates about your posts will show up here.'}</p>
          {tab === 'all' && <button type="button" className="rp-btn rp-btn--primary rp-btn--sm" onClick={() => navigate('/post')}>Create a post</button>}
        </div>
      )}

      <div className="nt__list">
        {shown.map((n) => (
          <button type="button" key={n._id} className={`nt__item${n.unread ? ' is-unread' : ''}`} onClick={() => { readOne(n); if (n.category === 'Messages' && n.relatedId) navigate(`/messages?conversation=${encodeURIComponent(n.relatedId)}`); }} aria-label={`${n.unread ? 'Unread: ' : ''}${n.title}`}>
            <span className={`nt__icon nt__icon--${n.category}`}><Icon name={ICON[n.category] || 'info'} size={19} /></span>
            <span className="nt__text">
              <span className="nt__title"><strong>{n.title}</strong><time>{n.time}</time></span>
              {n.message && <p className="nt__msg">{n.message}</p>}
            </span>
            {n.unread && <span className="nt__dot" aria-hidden="true" />}
          </button>
        ))}
      </div>

      {answering && (
        <Modal onClose={() => !busy && setAnswering(null)} icon={answering.status === 'Approved' ? 'heart' : 'flag'} tone={answering.status === 'Approved' ? 'ok' : 'bad'}
          title={answering.status === 'Approved' ? `Approve ${answering.request.applicant}?` : `Decline ${answering.request.applicant}?`}
          subtitle={answering.status === 'Approved'
            ? `${answering.request.animal} will be marked as adopted and removed from Browse. Other requests for this pet will be declined.`
            : 'The adopter will be notified. You can add a short reason they will see.'}
          footer={(
            <>
              <button type="button" className="rp-btn rp-btn--ghost" disabled={busy} onClick={() => setAnswering(null)}>Cancel</button>
              <button type="button" className={`rp-btn ${answering.status === 'Approved' ? 'rp-btn--ok' : 'rp-btn--solid-danger'}`} disabled={busy} onClick={confirmAnswer}>
                {busy ? 'Saving...' : answering.status === 'Approved' ? 'Yes, approve' : 'Decline request'}
              </button>
            </>
          )}>
          {answering.status === 'Rejected' && (
            <div className="rp-field">
              <div className="rp-label__row"><label className="rp-label" htmlFor="decline-reason">Reason <span className="rp-opt">(optional)</span></label><span className="rp-counter">{reason.length}/500</span></div>
              <textarea id="decline-reason" className="rp-input" value={reason} maxLength={500} onChange={(e) => setReason(e.target.value)} />
            </div>
          )}
        </Modal>
      )}
      {toast && <div className={`rp-toast rp-toast--${toast.bad ? 'bad' : 'ok'}`} role="status">{toast.msg}</div>}
    </div>
  );
}
