import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

const BRAND = '#9E4624';
const STATUS = {
  'Needs Review': { text: 'Waiting for you', bg: '#fef3c7', color: '#92400e' },
  Approved: { text: 'Approved · pet adopted', bg: '#dcfce7', color: '#166534' },
  Rejected: { text: 'Declined', bg: '#fee2e2', color: '#b91c1c' },
};

// The bell page: someone wants to adopt one of MY pets. I approve or decline.
export default function Notifications() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', bad: false });

  const say = (text, bad = false) => { setMessage({ text, bad }); setTimeout(() => setMessage({ text: '', bad: false }), 5000); };
  const load = () => api('/applications/received').then(setRequests).catch((e) => say(e.message, true)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const answer = async (r, status) => {
    let reviewNote = '';
    if (status === 'Approved') {
      if (!window.confirm(`Approve ${r.applicant} to adopt ${r.animal}?\n\n${r.animal} will be marked as adopted and removed from Browse. Other requests for this pet will be declined.`)) return;
    } else {
      const reason = window.prompt('Reason for declining? (optional, the adopter will see it)');
      if (reason === null) return;
      reviewNote = reason;
    }
    try {
      await api(`/applications/${r.id}/review`, { method: 'PATCH', body: { status, reviewNote } });
      say(status === 'Approved' ? `${r.animal} is now marked as adopted. Congratulations!` : 'Request declined.');
      load();
    } catch (e) { say(e.message, true); }
  };

  const waiting = requests.filter((r) => r.status === 'Needs Review');
  const answered = requests.filter((r) => r.status !== 'Needs Review');

  const Row = ({ r }) => {
    const st = STATUS[r.status] || STATUS['Needs Review'];
    const d = r.details || {};
    return (
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <img src={r.img} alt={r.animal} style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '10px' }} />
        <div style={{ flex: 1, minWidth: '220px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <strong style={{ fontSize: '15px', color: '#0f172a' }}>{r.applicant} wants to adopt {r.animal}</strong>
            <span style={{ background: st.bg, color: st.color, padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>{st.text}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>{r.date}</div>
          <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '8px', padding: '8px 10px', fontSize: '12px', color: '#334155', lineHeight: 1.6 }}>
            <div>📞 {r.contact.phone} · ✉️ {r.contact.email}</div>
            <div>📍 {r.contact.address}</div>
            {d.notesToFoster && <div>💬 {d.notesToFoster}</div>}
          </div>
          {r.status === 'Needs Review' && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button onClick={() => answer(r, 'Approved')} style={{ background: '#047857', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>✓ Approve adoption</button>
              <button onClick={() => answer(r, 'Rejected')} style={{ background: '#fff', color: '#b91c1c', border: '1px solid #fca5a5', padding: '8px 14px', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>Decline</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '24px 20px 60px', textAlign: 'left', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <h1 style={{ margin: '0 0 4px', fontSize: '26px', color: '#0f172a' }}>Notifications</h1>
      <p style={{ margin: '0 0 18px', color: '#64748b', fontSize: '14px' }}>People who want to adopt the pets you posted.</p>

      {message.text && <div style={{ marginBottom: '14px', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', background: message.bad ? '#fee2e2' : '#dcfce7', color: message.bad ? '#b91c1c' : '#166534' }}>{message.text}</div>}
      {loading && <p style={{ color: '#64748b' }}>Loading...</p>}

      {!loading && requests.length === 0 && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '30px', textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '32px' }}>⩍</div>
          <p style={{ margin: '8px 0 14px' }}>No adoption requests yet.</p>
          <button onClick={() => navigate('/post')} style={{ background: BRAND, color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>Post a pet</button>
        </div>
      )}

      {waiting.length > 0 && (
        <>
          <h3 style={{ fontSize: '13px', letterSpacing: '0.5px', color: '#64748b', margin: '0 0 10px' }}>WAITING FOR YOU ({waiting.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>{waiting.map((r) => <Row key={r.id} r={r} />)}</div>
        </>
      )}
      {answered.length > 0 && (
        <>
          <h3 style={{ fontSize: '13px', letterSpacing: '0.5px', color: '#64748b', margin: '0 0 10px' }}>ANSWERED</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>{answered.map((r) => <Row key={r.id} r={r} />)}</div>
        </>
      )}
    </div>
  );
}
