import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { publicApi, ADMIN_URL } from '../api';
import Icon from '../components/Icons';
import PasswordField from '../components/PasswordField';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import './Auth.css';

const HERO = 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80';

export default function Login({ setIsLoggedIn, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  // Signing in is just email + password. (The emailed code is only used for sign-up, forgot password and changing a password.)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await publicApi('/auth/login', { email: email.trim().toLowerCase(), password });
      const me = { _id: data._id, name: data.name, email: data.email, roles: data.roles, avatar: data.avatar || '' };
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(me));
      sessionStorage.setItem('justLoggedIn', JSON.stringify({ name: data.name, email: data.email }));
      if (data.roles?.includes('admin')) {
        window.location.href = `${ADMIN_URL}/?token=${data.token}`;
        return;
      }
      setIsLoggedIn?.(true);
      setUser?.(me);
      navigate('/');
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="auth rp-page">
      <div className="auth__card" style={{ maxWidth: 920 }}>
        <aside className="auth__hero" style={{ flex: 1 }}>
          <div className="auth__brand"><span className="auth__logo"><Icon name="paw" size={18} /></span>RescuePaws</div>
          <img className="auth__photo" src={HERO} alt="A rescued dog smiling" />
          <div>
            <h1>Welcome back to<br />RescuePaws</h1>
            <p>Your daily hub for pet rescues, sightings and loving adoptions.</p>
          </div>
        </aside>

        <section className="auth__form" style={{ flex: 1.2 }}>
          <div>
            <div className="auth__tabs">
              <button type="button" className="auth__tab auth__tab--on">Log In</button>
              <button type="button" className="auth__tab" onClick={() => navigate('/register')}>Sign Up</button>
            </div>
            <h2>Access your account</h2>
            <p className="auth__lead">Sign in to post sightings, foster pets and follow your adoption requests.</p>

            <form onSubmit={handleSubmit}>
              {location.state?.notice && <div className="rp-alert rp-alert--ok" role="status">{location.state.notice}</div>}
              {error && <div className="rp-alert rp-alert--bad" role="alert">{error}</div>}
              <div className="rp-field">
                <label className="rp-label" htmlFor="login-email">Email Address</label>
                <div className="rp-input-wrap">
                  <Icon name="mail" size={16} className="rp-input-wrap__icon" />
                  <input id="login-email" className="rp-input rp-input--bare" type="email" placeholder="name@gmail.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value.replace(/\s/g, ''))} required maxLength={254} />
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <PasswordField label="Password" value={password} onChange={setPassword} autoComplete="current-password" lenient />
                <button type="button" className="rp-link" style={{ position: 'absolute', top: 0, right: 0, fontSize: 12 }} onClick={() => setForgotOpen(true)}>Forgot password?</button>
              </div>

              <button type="submit" className="rp-btn rp-btn--primary rp-btn--block" disabled={submitting} style={{ marginTop: 6 }}>
                {submitting ? 'Logging in...' : <>Log In <Icon name="arrow" size={15} /></>}
              </button>
            </form>
          </div>
          <div className="auth__foot">Don't have an account? <button type="button" className="rp-link" onClick={() => navigate('/register')}>Sign Up</button></div>
        </section>
      </div>

      {forgotOpen && <ForgotPasswordModal onClose={() => setForgotOpen(false)} onDone={() => setForgotOpen(false)} />}
    </div>
  );
}
