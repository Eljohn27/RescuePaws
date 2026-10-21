import React, { useState } from 'react';
import { api } from '../api';
import ImagePicker from './ImagePicker';
import { cleanFullName, cleanPhone, fullNameProblem, phoneProblem, toLocalPhone, landmarkProblem, cleanLandmark } from '../utils/validators';
import { DAGUPAN_BARANGAYS, DAGUPAN_CODE } from '../utils/dagupanLocation';

export const REPORT_REASONS = ['Spam or fake post', 'Not a real stray or pet', 'Inappropriate content', 'Wrong or misleading information', 'Animal abuse or selling animals', 'Other'];

// FOSTER: request to adopt (goes to the poster)
export function RequestForm({ item, user, onDone }) {
  const [f, setF] = useState(() => {
    const parts = String(user?.name || '').trim().split(/\s+/).filter(Boolean);
    return { firstName: parts.shift() || '', middleInitial: '', lastName: parts.join(' '), phone: '', email: user?.email || '', barangayCode: '', streetLandmark: '', notes: '' };
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fullName = [f.firstName.trim(), f.middleInitial ? `${f.middleInitial.toLocaleUpperCase()}.` : '', f.lastName.trim()].filter(Boolean).join(' ');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const nameIssue = fullNameProblem(fullName);
    if (!f.firstName.trim() || !f.lastName.trim()) return setError('First name and last name are required.');
    if (nameIssue) return setError(nameIssue);
    const phoneIssue = phoneProblem(f.phone);
    if (phoneIssue) return setError(phoneIssue);
    if (!/^[^\s@]+@gmail\.com$/i.test(f.email.trim())) return setError('Enter a valid Gmail address ending in @gmail.com.');
    if (!DAGUPAN_BARANGAYS.some((barangay) => barangay.code === f.barangayCode)) return setError('Choose a barangay in Dagupan City.');
    const streetIssue = landmarkProblem(f.streetLandmark);
    if (streetIssue) return setError(streetIssue);
    setBusy(true);
    try {
      await api(`/adoptions/${item.id}/applications`, { method: 'POST', body: {
        fullName,
        phone: toLocalPhone(f.phone),
        email: f.email.trim().toLowerCase(),
        cityMunicipalityCode: DAGUPAN_CODE,
        barangayCode: f.barangayCode,
        streetLandmark: f.streetLandmark.trim(),
        notes: f.notes.trim(),
      } });
      onDone(item, `Request sent to the poster of ${item.title}.`);
    } catch (err) { setError(err.message); setBusy(false); }
  };

  return (
    <form onSubmit={submit} noValidate>
      <div className="rp-field">
        <div className="rp-label__row"><span className="rp-label">Name <span className="rp-req">*</span></span><span className="rp-counter">{fullName.length}/50</span></div>
        <div className="rq-name-grid">
          <div><label className="rp-label" htmlFor="rq-first">First name <span className="rp-req">*</span></label><input id="rq-first" className="rp-input" autoComplete="given-name" placeholder="e.g. Ilana" value={f.firstName} maxLength={50} onChange={(e) => setF({ ...f, firstName: cleanFullName(e.target.value) })} /></div>
          <div><label className="rp-label" htmlFor="rq-mi">M.I. <span className="rp-opt">(optional)</span></label><input id="rq-mi" className="rp-input" autoComplete="additional-name" placeholder="e.g. D" value={f.middleInitial} maxLength={1} onChange={(e) => setF({ ...f, middleInitial: e.target.value.replace(/[^\p{L}\p{M}]/gu, '').slice(0, 1) })} /></div>
          <div><label className="rp-label" htmlFor="rq-last">Last name <span className="rp-req">*</span></label><input id="rq-last" className="rp-input" autoComplete="family-name" placeholder="e.g. Deana" value={f.lastName} maxLength={50} onChange={(e) => setF({ ...f, lastName: cleanFullName(e.target.value) })} /></div>
        </div>
        <div className="rp-hint">Letters, spaces, periods, hyphens and apostrophes. Middle initial is optional.</div>
      </div>
      <div className="rp-field"><label className="rp-label" htmlFor="rq-email">Email <span className="rp-req">*</span></label>
        <input id="rq-email" className="rp-input" type="email" value={f.email} maxLength={254} onChange={(e) => setF({ ...f, email: e.target.value.replace(/\s/g, '') })} /></div>
      <div className="rp-field"><label className="rp-label" htmlFor="rq-phone">Mobile number <span className="rp-req">*</span></label>
        <div className="rp-input-wrap"><span className="rp-input-wrap__prefix">+63</span><input id="rq-phone" className="rp-input rp-input--bare" type="tel" inputMode="numeric" autoComplete="tel-national" value={f.phone} maxLength={10} placeholder="9XX XXX XXXX" onChange={(e) => setF({ ...f, phone: cleanPhone(e.target.value) })} /><span className="rp-counter">{f.phone.length}/10</span></div>
        <div className="rp-hint">Enter 10 digits starting with 9.</div>
      </div>
      <div className="rp-field"><label className="rp-label">City <span className="rp-req">*</span></label>
        <div className="rp-input" aria-label="City">Dagupan City</div>
        <input type="hidden" name="cityMunicipalityCode" value={DAGUPAN_CODE} />
      </div>
      <div className="rp-field"><label className="rp-label" htmlFor="rq-barangay">Barangay <span className="rp-req">*</span></label>
        <select id="rq-barangay" className="rp-input" value={f.barangayCode} required onChange={(e) => setF({ ...f, barangayCode: e.target.value })}>
          <option value="">Choose a Dagupan City barangay</option>
          {DAGUPAN_BARANGAYS.map((barangay) => <option key={barangay.code} value={barangay.code}>{barangay.name}</option>)}
        </select>
      </div>
      <div className="rp-field"><div className="rp-label__row"><label className="rp-label" htmlFor="rq-street">Street or landmark <span className="rp-opt">(optional)</span></label><span className="rp-counter">{f.streetLandmark.length}/100</span></div>
        <input id="rq-street" className="rp-input" value={f.streetLandmark} maxLength={100} placeholder="e.g. Rizal Street near the public market" onChange={(e) => setF({ ...f, streetLandmark: cleanLandmark(e.target.value) })} />
        {landmarkProblem(f.streetLandmark) && <div className="rp-error">{landmarkProblem(f.streetLandmark)}</div>}
      </div>
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
