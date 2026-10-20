import React, { useEffect, useState } from 'react';
import { publicApi } from '../api';
import Modal from './Modal';
import PasswordField from './PasswordField';
import OtpField from './OtpField';
import { passwordProblem } from '../utils/validators';

// Forgot password: 1) enter email -> we email a 6-digit code  2) enter the code + a new password (same rules as sign-up).
export default function ForgotPasswordModal({ onClose, onDone }) {
  const [step, setStep] = useState('email'); // email | reset | done
  const [email, setEmail] = useState('');
  const [challenge, setChallenge] = useState('');
  const [masked, setMasked] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (step !== 'reset' || seconds <= 0) return undefined;
    const t = window.setTimeout(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearTimeout(t);
  }, [step, seconds]);

  const sendCode = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Enter the email address of your account.');
    setBusy(true);
    try {
      const data = await publicApi('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setChallenge(data.challengeToken);
      setMasked(data.email);
      setSeconds(data.resendAfterSeconds ?? 30);
      setStep('reset');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const resend = async () => {
    if (busy || seconds > 0) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const data = await publicApi('/auth/resend-reset-otp', { challengeToken: challenge });
      setChallenge(data.challengeToken);
      setOtp('');
      setSeconds(data.resendAfterSeconds ?? 30);
      setNotice(data.message || 'A new code was sent.');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const reset = async (e) => {
    e.preventDefault();
    setError('');
    const issue = passwordProblem(password);
    if (issue) return setError(issue);
    if (password !== confirm) return setError('Password and confirmation do not match.');
    setBusy(true);
    try {
      await publicApi('/auth/reset-password', { challengeToken: challenge, otp, newPassword: password });
      setStep('done');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  if (step === 'done') {
    return (
      <Modal title="Password updated" icon="check" tone="ok" locked maxWidth={380} subtitle="You can now log in with your new password."
        footer={<button type="button" className="rp-btn rp-btn--primary rp-btn--block" onClick={onDone}>Back to login</button>} />
    );
  }

  if (step === 'email') {
    return (
      <Modal title="Reset your password" icon="lock" onClose={onClose} maxWidth={400} subtitle="Enter your account email and we will send you a 6-digit code.">
        <form onSubmit={sendCode} noValidate>
          {error && <div className="rp-alert rp-alert--bad" role="alert">{error}</div>}
          <div className="rp-field">
            <label className="rp-label" htmlFor="fp-email">Registered email address <span className="rp-req">*</span></label>
            <input id="fp-email" className="rp-input" type="email" placeholder="name@gmail.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value.replace(/\s/g, ''))} maxLength={254} required />
          </div>
          <div className="rp-modal__footer" style={{ marginTop: 6 }}>
            <button type="button" className="rp-btn rp-btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="rp-btn rp-btn--primary" disabled={busy || !email}>{busy ? 'Sending...' : 'Send code'}</button>
          </div>
        </form>
      </Modal>
    );
  }

  return (
    <Modal title="Create a new password" icon="mail" onClose={onClose} locked maxWidth={420}
      subtitle={<>If <strong>{masked}</strong> has an account, we sent it a 6-digit code. It expires in 5 minutes.</>}>
      <form onSubmit={reset} noValidate>
        {error && <div className="rp-alert rp-alert--bad" role="alert">{error}</div>}
        {notice && <div className="rp-alert rp-alert--ok" role="status">{notice}</div>}
        <OtpField value={otp} onChange={setOtp} />
        <PasswordField label="New password" value={password} onChange={setPassword} autoComplete="new-password" meter />
        <PasswordField label="Confirm new password" value={confirm} onChange={setConfirm} autoComplete="new-password" error={confirm && password !== confirm ? 'Passwords do not match.' : ''} />
        <button type="submit" className="rp-btn rp-btn--primary rp-btn--block" disabled={busy || otp.length !== 6 || !password || !confirm}>{busy ? 'Saving...' : 'Confirm new password'}</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 13 }}>
          <button type="button" className="rp-link" disabled={busy || seconds > 0} onClick={resend}>{seconds > 0 ? `Resend code in ${seconds}s` : 'Resend code'}</button>
          <button type="button" className="rp-link" style={{ color: '#64748b' }} onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
}
