import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicApi } from '../api';
import Icon from '../components/Icons';
import Modal from '../components/Modal';
import PasswordField from '../components/PasswordField';
import OtpField from '../components/OtpField';
import TermsModal from '../components/TermsModal';
import { cleanFullName, fullNameProblem, cleanPhone, phoneProblem, toLocalPhone, passwordProblem } from '../utils/validators';
import './Auth.css';

const HERO = 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80';

export default function Register() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [middleInitial, setMiddleInitial] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAdopting, setIsAdopting] = useState(true);
  const [isReporting, setIsReporting] = useState(true);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [verifying, setVerifying] = useState(false);
  const [challenge, setChallenge] = useState('');
  const [otp, setOtp] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [resendSeconds, setResendSeconds] = useState(0);
  const [resending, setResending] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!verifying || resendSeconds <= 0) return undefined;
    const t = window.setTimeout(() => setResendSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearTimeout(t);
  }, [verifying, resendSeconds]);

  const fail = (msg) => setErrors([{ msg }]);
  const fullName = [
    firstName.trim(),
    middleInitial ? `${middleInitial.toLocaleUpperCase()}.` : '',
    lastName.trim(),
  ].filter(Boolean).join(' ');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problems = [];
    const name = fullName.trim();
    if (!firstName.trim() || !lastName.trim()) problems.push('First name and last name are required.');
    else {
      const nameIssue = fullNameProblem(name);
      if (nameIssue) problems.push(nameIssue);
    }
    if (!/^[^\s@]+@gmail\.com$/i.test(email.trim())) problems.push('Use a Gmail address ending in @gmail.com.');
    const phoneIssue = phoneProblem(phone);
    if (phoneIssue) problems.push(phoneIssue);
    const pwIssue = passwordProblem(password);
    if (pwIssue) problems.push(pwIssue);
    else if (password !== confirmPassword) problems.push('Password and confirmation do not match.');
    if (!isAdopting && !isReporting) problems.push('Select at least one purpose.');
    if (!agreedTerms) problems.push('Please agree to the Terms of Care to continue.');
    if (problems.length) return setErrors(problems.map((msg) => ({ msg })));

    setErrors([]);
    setSubmitting(true);
    try {
      const roles = [isAdopting && 'adopter', isReporting && 'reporter'].filter(Boolean);
      const data = await publicApi('/auth/register', { name, email: email.trim().toLowerCase(), phone: toLocalPhone(phone), password, roles, termsAccepted: agreedTerms });
      setChallenge(data.challengeToken);
      setMaskedEmail(data.email);
      setResendSeconds(data.resendAfterSeconds ?? 30);
      setOtp('');
      setNotice('');
      setVerifying(true);
    } catch (err) {
      fail(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const verify = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors([]);
    try {
      await publicApi('/auth/verify-registration-otp', { challengeToken: challenge, otp });
      setVerifying(false);
      setShowSuccess(true);
      setChallenge('');
    } catch (err) {
      fail(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    if (resending || resendSeconds > 0) return;
    setResending(true);
    setErrors([]);
    setNotice('');
    try {
      const data = await publicApi('/auth/resend-registration-otp', { challengeToken: challenge });
      setChallenge(data.challengeToken);
      setMaskedEmail(data.email || maskedEmail);
      setOtp('');
      setResendSeconds(data.resendAfterSeconds ?? 30);
      setNotice(data.message || 'A new verification code was sent.');
    } catch (err) {
      fail(err.message);
    } finally {
      setResending(false);
    }
  };

  const closeVerify = () => { setVerifying(false); setChallenge(''); setOtp(''); setResendSeconds(0); setErrors([]); setNotice(''); };
  const nameShown = fullName.trim();
  const nameIssueLive = nameShown.length >= 5 && firstName.trim() && lastName.trim() ? fullNameProblem(nameShown) : '';

  return (
    <div className="auth rp-page">
      <div className="auth__card">
        <aside className="auth__hero">
          <div className="auth__brand"><span className="auth__logo"><Icon name="paw" size={18} /></span>RescuePaws</div>
          <img className="auth__photo" src={HERO} alt="A rescued dog smiling" />
          <div>
            <h1>Welcome to<br />RescuePaws</h1>
            <p>Join a community where every report, share and adoption helps a stray find safety and a home.</p>
          </div>
        </aside>

        <section className="auth__form">
          <div>
            <div className="auth__tabs">
              <button type="button" className="auth__tab" onClick={() => navigate('/login')}>Log In</button>
              <button type="button" className="auth__tab auth__tab--on">Sign Up</button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <p className="rp-hint" style={{ margin: '0 0 12px' }}><span className="rp-req">*</span> Required</p>
              {errors.length > 0 && !verifying && (
                <div className="rp-alert rp-alert--bad" role="alert"><ul>{errors.map((er, i) => <li key={i}>{er.msg}</li>)}</ul></div>
              )}

              <div className="rp-field">
                <div className="rp-label__row">
                  <span className="rp-label">Name <span className="rp-req">*</span></span>
                  <span className="rp-counter">{fullName.length}/50</span>
                </div>
                <div className="auth__name-grid">
                  <div className="auth__name-field">
                    <label className="rp-label" htmlFor="reg-first-name">First Name <span className="rp-req">*</span></label>
                    <input id="reg-first-name" className="rp-input" type="text" placeholder="e.g. Ilana" autoComplete="given-name" value={firstName} maxLength={50}
                      onChange={(e) => setFirstName(cleanFullName(e.target.value))} />
                  </div>
                  <div className="auth__name-field">
                    <label className="rp-label" htmlFor="reg-middle-initial">M.I. <span className="rp-opt">(optional)</span></label>
                    <input id="reg-middle-initial" className="rp-input" type="text" placeholder="e.g. D" autoComplete="additional-name" value={middleInitial} maxLength={1}
                      onChange={(e) => setMiddleInitial(e.target.value.replace(/[^\p{L}\p{M}]/gu, '').slice(0, 1))} />
                  </div>
                  <div className="auth__name-field">
                    <label className="rp-label" htmlFor="reg-last-name">Last Name <span className="rp-req">*</span></label>
                    <input id="reg-last-name" className="rp-input" type="text" placeholder="e.g. Deana" autoComplete="family-name" value={lastName} maxLength={50}
                      onChange={(e) => setLastName(cleanFullName(e.target.value))} />
                  </div>
                </div>
                {nameIssueLive ? <div className="rp-error">{nameIssueLive}</div> : <div className="rp-hint">Letters, spaces, periods, hyphens and apostrophes. Middle initial is optional.</div>}
              </div>

              <div className="rp-row">
                <div className="rp-field">
                  <label className="rp-label" htmlFor="reg-email">Email Address <span className="rp-req">*</span></label>
                  <input id="reg-email" className="rp-input" type="email" placeholder="name@gmail.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value.replace(/\s/g, ''))} maxLength={254} />
                </div>
                <div className="rp-field">
                  <label className="rp-label" htmlFor="reg-phone">Phone Number <span className="rp-req">*</span></label>
                  <div className="rp-input-wrap">
                    <span className="rp-input-wrap__prefix">+63</span>
                    <input id="reg-phone" className="rp-input rp-input--bare" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="9XX XXX XXXX" value={phone} maxLength={10}
                      onChange={(e) => setPhone(cleanPhone(e.target.value))} />
                    <span className="rp-counter">{phone.length}/10</span>
                  </div>
                </div>
              </div>

              <div className="rp-row">
                <PasswordField label="Password" value={password} onChange={setPassword} autoComplete="new-password" meter />
                <PasswordField label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password"
                  error={confirmPassword && password !== confirmPassword ? 'Passwords do not match.' : ''} />
              </div>

              <div className="rp-field">
                <span className="rp-label">How will you use RescuePaws? <span className="rp-req">*</span></span>
                <div className="auth__roles">
                  <label className="auth__role">
                    <input type="checkbox" checked={isAdopting} onChange={(e) => setIsAdopting(e.target.checked)} />
                    <div><strong>I am adopting</strong><span>Give a stray or foster pet a home.</span></div>
                  </label>
                  <label className="auth__role">
                    <input type="checkbox" checked={isReporting} onChange={(e) => setIsReporting(e.target.checked)} />
                    <div><strong>Reporting strays</strong><span>Post sightings and foster pets.</span></div>
                  </label>
                </div>
              </div>

              <div className="auth__terms">
                <input type="checkbox" id="terms" checked={agreedTerms} onChange={(e) => setAgreedTerms(e.target.checked)} />
                <label htmlFor="terms">I agree to the <button type="button" className="rp-link" onClick={() => setShowTerms(true)}>Terms of Care</button>. <span className="rp-req">*</span></label>
              </div>

              <button type="submit" className="rp-btn rp-btn--primary rp-btn--block" disabled={submitting}>
                {submitting ? 'Sending your code...' : <>Create Account <Icon name="arrow" size={15} /></>}
              </button>
            </form>
          </div>
          <div className="auth__foot">Already have an account? <button type="button" className="rp-link" onClick={() => navigate('/login')}>Sign In</button></div>
        </section>
      </div>

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} onAgree={() => { setAgreedTerms(true); setShowTerms(false); }} />}

      {verifying && (
        <Modal title="Verify your Gmail" icon="mail" onClose={closeVerify} locked maxWidth={400}
          subtitle={<>Enter the 6-digit code sent to <strong>{maskedEmail}</strong>. Your account is created only after verification. The code expires in 5 minutes.</>}>
          <form onSubmit={verify}>
            {errors.map((er, i) => <div key={i} className="rp-alert rp-alert--bad" role="alert">{er.msg}</div>)}
            {notice && <div className="rp-alert rp-alert--ok" role="status">{notice}</div>}
            <OtpField value={otp} onChange={setOtp} />
            <button type="submit" className="rp-btn rp-btn--primary rp-btn--block" disabled={submitting || resending || otp.length !== 6}>{submitting ? 'Verifying...' : 'Verify and create account'}</button>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 13 }}>
              <button type="button" className="rp-link" disabled={resending || resendSeconds > 0} onClick={resend}>
                {resending ? 'Sending...' : resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : 'Resend code'}
              </button>
              <button type="button" className="rp-link" style={{ color: '#64748b' }} onClick={closeVerify}>Back to sign up</button>
            </div>
          </form>
        </Modal>
      )}

      {showSuccess && (
        <Modal title="Successfully signed up!" icon="check" tone="ok" locked maxWidth={380} subtitle="Your account has been created. You can now log in to get started."
          footer={<button type="button" className="rp-btn rp-btn--primary rp-btn--block" onClick={() => navigate('/login')}>Continue to Login</button>} />
      )}
    </div>
  );
}
