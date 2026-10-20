import React, { useEffect, useState } from 'react';
import { api } from '../api';
import Icon from '../components/Icons';
import Modal from '../components/Modal';
import PasswordField from '../components/PasswordField';
import OtpField from '../components/OtpField';
import { cleanFullName, fullNameProblem, cleanPhone, phoneProblem, toLocalPhone, fromLocalPhone, passwordProblem } from '../utils/validators';

const card = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 22, marginBottom: 16, textAlign: 'left' };

// The admin's own account: real details, real counters, and the same rules as the main site.
export default function AdminProfile({ adminUser, setAdminUser }) {
  const [stats, setStats] = useState(null);
  const [name, setName] = useState(adminUser?.name || '');
  const [phone, setPhone] = useState(fromLocalPhone(adminUser?.phone));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const say = (msg, bad = false) => { setToast({ msg, bad }); setTimeout(() => setToast(null), 4500); };

  useEffect(() => { api('/admin/stats').then(setStats).catch(() => {}); }, []);

  const save = async (e) => {
    e.preventDefault();
    setError('');
    const issue = fullNameProblem(name.trim()) || phoneProblem(phone);
    if (issue) return setError(issue);
    setSaving(true);
    try {
      const u = await api('/users/me', { method: 'PATCH', body: { name: name.trim(), phone: toLocalPhone(phone) } });
      setAdminUser((cur) => ({ ...cur, name: u.name, phone: u.phone }));
      say('Profile saved.');
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  const c = stats?.counters;
  const pending = stats ? (stats.sightings.byModeration['Pending for Approval'] || 0) + (stats.adoptionPosts.byModeration['Pending for Approval'] || 0) + ((stats.proofs && stats.proofs['Needs Review']) || 0) + (stats.reports?.open || 0) : null;
  const tiles = [['Strays rescued', c?.rescued], ['Sightings', c?.sightings], ['Foster posts', c?.fosters], ['Waiting for review', pending]];
  const since = adminUser?.createdAt ? new Date(adminUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ ...card, display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        <span className="rp-avatar" style={{ width: 72, height: 72, fontSize: 28 }}>{(adminUser?.name || '?')[0].toUpperCase()}</span>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ margin: 0, fontSize: 22, color: '#0f172a' }}>{adminUser?.name}</h2>
          <div style={{ fontSize: 13, color: '#64748b', wordBreak: 'break-all' }}>{adminUser?.email}</div>
          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="rp-badge" style={{ background: '#ffedd5', color: '#a34828' }}><Icon name="shield" size={12} /> Administrator</span>
            {since && <span className="rp-badge" style={{ background: '#f1f5f9', color: '#475569' }}>Member since {since}</span>}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 16 }}>
        {tiles.map(([label, n]) => (
          <div key={label} style={{ ...card, marginBottom: 0, padding: 16 }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#a34828' }}>{n ?? '-'}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{label}</div>
          </div>
        ))}
      </div>

      <form style={card} onSubmit={save} noValidate>
        <h3 style={{ margin: '0 0 14px', fontSize: 17 }}>Your details</h3>
        <div className="rp-field">
          <div className="rp-label__row"><label className="rp-label" htmlFor="ad-name">Full name</label><span className="rp-counter">{name.length}/50</span></div>
          <input id="ad-name" className="rp-input" value={name} maxLength={50} onChange={(e) => setName(cleanFullName(e.target.value))} />
        </div>
        <div className="rp-field">
          <label className="rp-label" htmlFor="ad-phone">Phone number</label>
          <div className="rp-input-wrap">
            <span className="rp-input-wrap__prefix">+63</span>
            <input id="ad-phone" className="rp-input rp-input--bare" type="tel" inputMode="numeric" placeholder="9XX XXX XXXX" value={phone} maxLength={10} onChange={(e) => setPhone(cleanPhone(e.target.value))} />
            <span className="rp-counter">{phone.length}/10</span>
          </div>
        </div>
        {error && <div className="rp-alert rp-alert--bad" role="alert">{error}</div>}
        <button type="submit" className="rp-btn rp-btn--primary" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
      </form>

      <PasswordChange onDone={(m) => say(m)} />
      {toast && <div className={`rp-toast rp-toast--${toast.bad ? 'bad' : 'ok'}`} role="status">{toast.msg}</div>}
    </div>
  );
}

function PasswordChange({ onDone }) {
  const [f, setF] = useState({ current: '', next: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(null);
  const [otp, setOtp] = useState('');
  const [modalError, setModalError] = useState('');
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!step || seconds <= 0) return undefined;
    const t = setTimeout(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(t);
  }, [step, seconds]);

  const request = async (e) => {
    e.preventDefault();
    setError('');
    const issue = passwordProblem(f.next);
    if (issue) return setError(issue.replace('Password', 'New password'));
    if (f.next === f.current) return setError('New password must be different from the current one.');
    if (f.next !== f.confirm) return setError('New password and confirmation do not match.');
    setBusy(true);
    try {
      const r = await api('/users/me/password/request', { method: 'POST', body: { currentPassword: f.current, newPassword: f.next } });
      setStep({ token: r.challengeToken, email: r.email }); setSeconds(r.resendAfterSeconds ?? 30); setOtp(''); setModalError('');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const confirm = async () => {
    setBusy(true); setModalError('');
    try {
      const r = await api('/users/me/password', { method: 'PATCH', body: { challengeToken: step.token, otp } });
      if (r.token) localStorage.setItem('adminToken', r.token);
      setStep(null); setF({ current: '', next: '', confirm: '' });
      onDone('Password updated. Other devices were signed out.');
    } catch (err) { setModalError(err.message); } finally { setBusy(false); }
  };

  const resend = async () => {
    if (busy || seconds > 0) return;
    setBusy(true); setModalError('');
    try {
      const r = await api('/users/me/password/resend', { method: 'POST', body: { challengeToken: step.token } });
      setStep({ token: r.challengeToken, email: r.email }); setSeconds(r.resendAfterSeconds ?? 30); setOtp('');
    } catch (err) { setModalError(err.message); } finally { setBusy(false); }
  };

  return (
    <>
      <form style={card} onSubmit={request} noValidate>
        <h3 style={{ margin: '0 0 14px', fontSize: 17 }}>Change password</h3>
        <PasswordField label="Current password" value={f.current} onChange={(v) => setF({ ...f, current: v })} autoComplete="current-password" lenient />
        <PasswordField label="New password" value={f.next} onChange={(v) => setF({ ...f, next: v })} autoComplete="new-password" meter />
        <PasswordField label="Confirm new password" value={f.confirm} onChange={(v) => setF({ ...f, confirm: v })} autoComplete="new-password" error={f.confirm && f.next !== f.confirm ? 'Passwords do not match.' : ''} />
        {error && <div className="rp-alert rp-alert--bad" role="alert">{error}</div>}
        <button type="submit" className="rp-btn rp-btn--primary" disabled={busy || !f.current || !f.next || !f.confirm}>{busy && !step ? 'Sending code...' : 'Send verification code'}</button>
        <div className="rp-hint" style={{ marginTop: 8 }}>We email a 6-digit code to confirm the change.</div>
      </form>
      {step && (
        <Modal title="Confirm password change" icon="mail" locked maxWidth={400} subtitle={<>Enter the 6-digit code sent to <strong>{step.email}</strong>. It expires in 5 minutes.</>}>
          <div>
            {modalError && <div className="rp-alert rp-alert--bad" role="alert">{modalError}</div>}
            <OtpField value={otp} onChange={setOtp} />
            <button type="button" className="rp-btn rp-btn--primary rp-btn--block" disabled={busy || otp.length !== 6} onClick={confirm}>{busy ? 'Saving...' : 'Confirm and update password'}</button>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 13 }}>
              <button type="button" className="rp-link" disabled={busy || seconds > 0} onClick={resend}>{seconds > 0 ? `Resend code in ${seconds}s` : 'Resend code'}</button>
              <button type="button" className="rp-link" style={{ color: '#64748b' }} onClick={() => setStep(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
