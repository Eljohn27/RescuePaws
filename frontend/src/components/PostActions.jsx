import React, { useState } from 'react';
import { api } from '../api';
import ImagePicker from './ImagePicker';
import { cleanFullName, fullNameProblem } from '../utils/validators';

export const REPORT_REASONS = ['Spam or fake post', 'Not a real stray or pet', 'Inappropriate content', 'Wrong or misleading information', 'Animal abuse or selling animals', 'Other'];

// FOSTER: request to adopt (goes to the poster)
export function RequestForm({ item, user, onDone }) {
  const [f, setF] = useState({ fullName: user?.name || '', phone: '', email: user?.email || '', address: '', notes: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const nameIssue = fullNameProblem(f.fullName);
    if (nameIssue) return setError(nameIssue);
    if (!/^09\d{9}$/.test(f.phone)) return setError('Enter your mobile number: 11 digits starting with 09.');
    if (f.address.trim().length < 5) return setError('Enter your address (at least 5 characters).');
    setBusy(true);
    try {
      await api(`/adoptions/${item.id}/applications`, { method: 'POST', body: { ...f, fullName: f.fullName.trim(), address: f.address.trim(), notes: f.notes.trim() } });
      onDone(item, `Request sent to the poster of ${item.title}.`);
    } catch (err) { setError(err.message); setBusy(false); }
  };

  return (
    <form onSubmit={submit} noValidate>
      <div className="rp-field"><label className="rp-label" htmlFor="rq-name">Full name<span className="rp-req"> *</span></label>
        <input id="rq-name" className="rp-input" value={f.fullName} maxLength={50} onChange={(e) => setF({ ...f, fullName: cleanFullName(e.target.value) })} /></div>
      <div className="rp-field"><label className="rp-label" htmlFor="rq-phone">Mobile number<span className="rp-req"> *</span></label>
        <input id="rq-phone" className="rp-input" inputMode="numeric" value={f.phone} maxLength={11} placeholder="09XX XXX XXXX" onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 11) })} /></div>
      <div className="rp-field"><label className="rp-label" htmlFor="rq-email">Email<span className="rp-req"> *</span></label>
        <input id="rq-email" className="rp-input" type="email" value={f.email} maxLength={254} onChange={(e) => setF({ ...f, email: e.target.value.replace(/\s/g, '') })} /></div>
      <div className="rp-field"><label className="rp-label" htmlFor="rq-address">Address<span className="rp-req"> *</span></label>
        <input id="rq-address" className="rp-input" value={f.address} maxLength={200} onChange={(e) => setF({ ...f, address: e.target.value })} /></div>
      <div className="rp-field"><label className="rp-label" htmlFor="rq-notes">Message <span className="rp-opt">(optional)</span></label>
        <textarea id="rq-notes" className="rp-input" value={f.notes} maxLength={1000} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="Tell the poster why you'd be a good home." /></div>
      {error && <div className="rp-alert rp-alert--bad" role="alert">{error}</div>}
      <button type="submit" disabled={busy} className="rp-btn rp-btn--primary rp-btn--block">{busy ? 'Sending...' : 'Send Request'}</button>
    </form>
  );
}

// STRAY: proof that I took the animal in (goes to the admin)
export function ProofForm({ item, onDone }) {
  const [photoUrl, setPhotoUrl] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setBusy(true); setError('');
    try {
      await api(`/sightings/${item.id}/proofs`, { method: 'POST', body: { photoUrl, message: message.trim() } });
      onDone(item, 'Proof sent. An admin will review it.');
    } catch (err) { setError(err.message); setBusy(false); }
  };
  const ready = photoUrl && message.trim().length >= 3;
  return (
    <>
      <div className="rp-field"><ImagePicker label="Photo of you with the animal" value={photoUrl} onChange={setPhotoUrl} /></div>
      <div className="rp-field"><label className="rp-label" htmlFor="pf-msg">Message</label>
        <textarea id="pf-msg" className="rp-input" value={message} maxLength={500} onChange={(e) => setMessage(e.target.value)} placeholder="e.g. I took him home today and he is safe." /></div>
      {error && <div className="rp-alert rp-alert--bad" role="alert">{error}</div>}
      <button type="button" onClick={submit} disabled={busy || !ready} className="rp-btn rp-btn--primary rp-btn--block">{busy ? 'Sending...' : 'Send Proof'}</button>
    </>
  );
}

// Report a post to the admins
export function ReportForm({ item, onDone }) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const r = await api('/reports', { method: 'POST', body: { targetType: item.kind === 'stray' ? 'sighting' : 'adoption', targetId: item.id, reason, ...(details.trim() ? { details: details.trim() } : {}) } });
      onDone(item, r.message);
    } catch (err) { setError(err.message); setBusy(false); }
  };

  return (
    <form onSubmit={submit}>
      <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
        <legend className="rp-label">Why are you reporting this post?<span className="rp-req"> *</span></legend>
        {REPORT_REASONS.map((r) => (
          <label key={r} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '9px 12px', border: `1px solid ${reason === r ? 'var(--brand)' : 'var(--line)'}`, background: reason === r ? 'var(--brand-soft)' : '#fff', borderRadius: 10, marginBottom: 7, cursor: 'pointer', fontSize: 13 }}>
            <input type="radio" name="report-reason" value={r} checked={reason === r} onChange={() => setReason(r)} style={{ accentColor: '#9e4624' }} /> {r}
          </label>
        ))}
      </fieldset>
      <div className="rp-field" style={{ marginTop: 10 }}>
        <div className="rp-label__row"><label className="rp-label" htmlFor="rp-details">More details <span className="rp-opt">(optional)</span></label><span className="rp-counter">{details.length}/300</span></div>
        <textarea id="rp-details" className="rp-input" value={details} maxLength={300} onChange={(e) => setDetails(e.target.value)} />
      </div>
      {error && <div className="rp-alert rp-alert--bad" role="alert">{error}</div>}
      <button type="submit" disabled={busy || !reason} className="rp-btn rp-btn--solid-danger rp-btn--block">{busy ? 'Sending...' : 'Submit report'}</button>
    </form>
  );
}
