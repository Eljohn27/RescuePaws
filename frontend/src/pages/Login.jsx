import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ setIsLoggedIn, setUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors(data.errors || [{ path: 'general', msg: data.message }]);
        setSubmitting(false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ _id: data._id, name: data.name, email: data.email, roles: data.roles }));

      // Tell the destination page to show the welcome modal (one-time)
      sessionStorage.setItem('justLoggedIn', JSON.stringify({
        name: data.name,
        email: data.email,
      }));

      if (data.roles && data.roles.includes('admin')) {
        // Different port = different origin, so localStorage on this site
        // isn't visible over there. Pass the token through the URL once;
        // the admin app grabs it, stores its own copy, then scrubs the URL.
        window.location.href = `http://localhost:5174/?token=${data.token}`;
        return;
      }

      if (setIsLoggedIn) setIsLoggedIn(true);
      if (setUser) setUser({ name: data.name, email: data.email });

      navigate('/');
    } catch (err) {
      setErrors([{ path: 'general', msg: 'Could not reach the server. Is the backend running?' }]);
      setSubmitting(false);
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();

    const storedUserRaw = localStorage.getItem('registeredUser');

    if (!storedUserRaw) {
      alert('No account found! Please Sign Up first.');
      setIsForgotPasswordOpen(false);
      navigate('/register');
      return;
    }

    const storedUser = JSON.parse(storedUserRaw);

    if (resetEmail.toLowerCase() !== storedUser.email.toLowerCase()) {
      alert('Email not found! Please make sure you enter your registered email address.');
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      alert('New password and confirm password do not match!');
      return;
    }

    if (resetNewPassword.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    const updatedUser = {
      ...storedUser,
      password: resetNewPassword
    };

    localStorage.setItem('registeredUser', JSON.stringify(updatedUser));

    alert('✅ Password reset successful! You can now log in with your new password.');
    
    setIsForgotPasswordOpen(false);
    setResetEmail('');
    setResetNewPassword('');
    setResetConfirmPassword('');
  };

  return (
    <div style={{
      backgroundColor: '#f1f5f9',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '920px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        overflow: 'hidden',
        minHeight: '540px'
      }}>
        
        <div style={{
          flex: '1',
          background: 'linear-gradient(160deg, #b04e28 0%, #873a1d 100%)',
          backgroundColor: '#9E4624',
          padding: '36px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>🐾</div>
            <span style={{ fontWeight: '700', fontSize: '18px' }}>RescuePaws</span>
          </div>

          <div style={{ width: '100%', height: '210px', borderRadius: '12px', overflow: 'hidden', margin: '24px 0' }}>
            <img 
              src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80" 
              alt="Rescue Dog" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', lineHeight: '1.2', marginBottom: '10px' }}>
              Welcome back to<br />RescuePaws
            </h1>
            <p style={{ fontSize: '12px', opacity: 0.85, margin: 0 }}>
              Your daily hub for pet rescues, sightings, and loving adoptions.
            </p>
          </div>
        </div>

        <div style={{
          flex: '1.2',
          padding: '40px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ backgroundColor: '#eef2ff', padding: '4px', borderRadius: '8px', display: 'flex', marginBottom: '32px' }}>
              <button 
                type="button"
                style={{ flex: 1, padding: '8px 0', border: 'none', borderRadius: '6px', backgroundColor: '#ffffff', color: '#9E4624', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
              >
                Log In
              </button>
              <button 
                type="button"
                onClick={() => navigate('/register')}
                style={{ flex: 1, padding: '8px 0', border: 'none', borderRadius: '6px', backgroundColor: 'transparent', color: '#64748b', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}
              >
                Sign Up
              </button>
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
              Access Your Portal
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 24px 0' }}>
              Enter your credentials to coordinate pet rescues or manage your adoption profile.
            </p>

            <form onSubmit={handleSubmit}>
              {errors.length > 0 && (
                <div style={{ marginBottom: '16px', padding: '10px 12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
                  {errors.map((err, i) => (
                    <div key={i} style={{ fontSize: '11px', color: '#dc2626', marginBottom: i < errors.length - 1 ? '4px' : 0 }}>
                      • {err.msg}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155' }}>Email Address</label>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>e.g. name@university.edu</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '0 12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#94a3b8', marginRight: '8px', fontSize: '14px' }}></span>
                  <input 
                    type="email" 
                    placeholder="name@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 0', border: 'none', backgroundColor: 'transparent', outline: 'none', fontSize: '13px', color: '#334155' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155' }}>Password</label>
                  
                  <button 
                    type="button" 
                    onClick={() => setIsForgotPasswordOpen(true)}
                    style={{ background: 'none', border: 'none', padding: 0, fontSize: '11px', color: '#9E4624', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Forgot password?
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '0 12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#94a3b8', marginRight: '8px', fontSize: '13px' }}></span>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 0', border: 'none', backgroundColor: 'transparent', outline: 'none', fontSize: '13px', color: '#334155' }}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <input 
                  type="checkbox" 
                  id="keepSigned" 
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  style={{ accentColor: '#9E4624', cursor: 'pointer' }}
                />
                <label htmlFor="keepSigned" style={{ fontSize: '11px', color: '#64748b', cursor: 'pointer' }}>
                  Keep me signed in on this device
                </label>
              </div>

              <button 
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  backgroundColor: submitting ? '#c17a5c' : '#9E4624',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? 'Logging In...' : 'Log In →'}
              </button>
            </form>
          </div>

          <div style={{ textAlign: 'center', fontSize: '12px', color: '#64748b', marginTop: '20px' }}>
            Don't have an account?{' '}
            <button 
              type="button" 
              onClick={() => navigate('/register')} 
              style={{ background: 'none', border: 'none', padding: 0, color: '#9E4624', fontWeight: '700', cursor: 'pointer', fontSize: '12px' }}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>

      {isForgotPasswordOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '32px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
              Reset Your Password
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 20px 0' }}>
              Verify your registered email address and enter your new password below.
            </p>

            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Registered Email Address
                </label>
                <input 
                  type="email"
                  placeholder="name@gmail.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  New Password
                </label>
                <input 
                  type="password"
                  placeholder="Enter new password"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Confirm New Password
                </label>
                <input 
                  type="password"
                  placeholder="Re-enter new password"
                  value={resetConfirmPassword}
                  onChange={(e) => setResetConfirmPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(false)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#9E4624',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Save New Password
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}