import React, { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api';
import Icon from '../components/Icons';

const POLL_MS = 10000;
const ICON = { Adoption: 'heart', Sightings: 'pin', Reports: 'flag', System: 'info' };
const TONE = {
  Adoption: { bg: '#ffe4e6', color: '#e11d48' },
  Sightings: { bg: '#e0f2fe', color: '#0369a1' },
  Reports: { bg: '#fef3c7', color: '#b45309' },
  System: { bg: '#f1f5f9', color: '#64748b' },
};

// Real admin inbox: new posts, rescue proofs and reports show up here by themselves.
export default function AdminNotifications({ onChanged }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const alive = useRef(true);

  const load = useCallback(async () => {
    try {
      const r = await api('/notifications');
      if (alive.current) setItems(r.notifications);
    } catch { /* keep what we have; the next refresh tries again */ } finally {
      if (alive.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    load();
    const timer = setInterval(load, POLL_MS);
    return () => { alive.current = false; clearInterval(timer); };
  }, [load]);

  const unread = items.filter((i) => i.unread).length;

  const readOne = async (n) => {
    if (!n.unread) return;
    setItems((list) => list.map((i) => (i._id === n._id ? { ...i, unread: false } : i)));
    try { await api(`/notifications/${n._id}/read`, { method: 'PATCH' }); } catch { /* corrected on next refresh */ }
    onChanged?.();
  };
  const readAll = async () => {
    setItems((list) => list.map((i) => ({ ...i, unread: false })));
    try { await api('/notifications/read-all', { method: 'PATCH' }); } catch { /* corrected on next refresh */ }
    onChanged?.();
  };

  const shown = tab === 'unread' ? items.filter((i) => i.unread) : items;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'left' }}>
      <div className="adm-bar">
        <div>
          <h2 className="adm-title">Admin Notifications</h2>
          <p className="adm-sub" style={{ margin: 0 }}>New posts, proofs and reports. This page updates by itself.</p>
        </div>
        <button type="button" className="rp-btn rp-btn--ghost rp-btn--sm" onClick={readAll} disabled={!unread}><Icon name="check" size={14} stroke={3} /> Mark all as read</button>
      </div>

      <div className="adm-tabs" style={{ marginBottom: 14 }}>
        <button type="button" className={`adm-tab${tab === 'all' ? ' is-on' : ''}`} onClick={() => setTab('all')}>All ({items.length})</button>
        <button type="button" className={`adm-tab${tab === 'unread' ? ' is-on' : ''}`} onClick={() => setTab('unread')}>Unread ({unread})</button>
      </div>

      {loading && <p style={{ color: '#64748b' }}>Loading...</p>}
      {!loading && shown.length === 0 && <div className="adm-empty" style={{ textAlign: 'center' }}><Icon name="bell" size={28} /><p style={{ margin: '8px 0 0' }}>{tab === 'unread' ? 'You are all caught up.' : 'No notifications yet.'}</p></div>}

      <div className="adm-list" style={{ gap: 10 }}>
        {shown.map((n) => {
          const tone = TONE[n.category] || TONE.System;
          return (
            <button type="button" key={n._id} onClick={() => readOne(n)} aria-label={`${n.unread ? 'Unread: ' : ''}${n.title}`}
              style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 16px', borderRadius: 12, border: `1px solid ${n.unread ? '#fed7aa' : '#e2e8f0'}`, background: n.unread ? '#fff7ed' : '#fff', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'inherit' }}>
              <span style={{ width: 40, height: 40, borderRadius: 12, background: tone.bg, color: tone.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={ICON[n.category] || 'info'} size={19} /></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: 14, color: '#0f172a' }}>{n.title}</strong>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{n.time}</span>
                </span>
                {n.message && <span style={{ display: 'block', marginTop: 3, fontSize: 13, color: '#475569', lineHeight: 1.5, wordBreak: 'break-word' }}>{n.message}</span>}
              </span>
              {n.unread && <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', marginTop: 6, flexShrink: 0 }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
