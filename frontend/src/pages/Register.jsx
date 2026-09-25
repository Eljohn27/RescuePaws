import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAdopting, setIsAdopting] = useState(true);
  const [isReporting, setIsReporting] = useState(true);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    if (password !== confirmPassword) {
      setErrors([{ path: 'confirmPassword', msg: 'New password and Confirm password do not match!' }]);
      return;
    }

    if (!agreedTerms) {
      setErrors([{ path: 'agreedTerms', msg: 'Please review and agree to the Terms of Care to continue.' }]);
      return;
    }

    const roles = [];
    if (isAdopting) roles.push('adopter');
    if (isReporting) roles.push('reporter');

    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: email.toLowerCase(),
          phone,
          password,
          roles,
          termsAccepted: agreedTerms,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors(data.errors || [{ path: 'general', msg: data.message }]);
        setSubmitting(false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ _id: data._id, name: data.name, email: data.email, roles: data.roles }));

      setShowSuccessModal(true);
    } catch (err) {
      setErrors([{ path: 'general', msg: 'Could not reach the server. Is the backend running?' }]);
      setSubmitting(false);
    }
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
        maxWidth: '960px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        overflow: 'hidden',
        minHeight: '580px'
      }}>
        
        {/* LEFT HERO PANEL */}
        <div style={{
          flex: '0.85',
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
            <div style={{ fontWeight: '700', fontSize: '18px' }}>RescuePaws</div>
          </div>

          <div style={{ width: '100%', height: '220px', borderRadius: '12px', overflow: 'hidden', margin: '20px 0' }}>
            <img 
              src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80" 
              alt="Rescue Dog" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', lineHeight: '1.2', marginBottom: '10px' }}>
              Welcome to<br />RescuePaws
            </h1>
            <p style={{ fontSize: '11px', opacity: 0.85, lineHeight: '1.5', margin: 0 }}>
              To build compassionate community join a dedicated, crowd-sourced safety net where every report, share, and adoption directly saves lives.
            </p>
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div style={{
          flex: '1.15',
          padding: '36px 44px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ backgroundColor: '#eef2ff', padding: '4px', borderRadius: '8px', display: 'flex', marginBottom: '32px' }}>
              <button 
                type="button"
                onClick={() => navigate('/login')}
                style={{ flex: 1, padding: '8px 0', border: 'none', borderRadius: '6px', backgroundColor: 'transparent', color: '#64748b', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}
              >
                Log In
              </button>
              <button 
                type="button"
                style={{ flex: 1, padding: '8px 0', border: 'none', borderRadius: '6px', backgroundColor: '#ffffff', color: '#9E4624', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {errors.length > 0 && (
                <div style={{ marginBottom: '14px', padding: '10px 12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
                  {errors.map((err, i) => (
                    <div key={i} style={{ fontSize: '11px', color: '#dc2626', marginBottom: i < errors.length - 1 ? '4px' : 0 }}>
                      • {err.msg}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155' }}>Full Name</label>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>e.g. Maya Lin</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '0 12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#94a3b8', marginRight: '8px', fontSize: '13px' }}></span>
                  <input 
                    type="text" 
                    placeholder="Ilana Deana"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value.replace(/[^A-Za-z\s'-]/g, ''))}
                    required
                    style={{ width: '100%', padding: '9px 0', border: 'none', backgroundColor: 'transparent', outline: 'none', fontSize: '12px', color: '#334155' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Email Address</label>
                  <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '0 10px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#94a3b8', marginRight: '6px', fontSize: '12px' }}></span>
                    <input 
                      type="email" 
                      placeholder="Ilana@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{ width: '100%', padding: '9px 0', border: 'none', backgroundColor: 'transparent', outline: 'none', fontSize: '11px', color: '#334155' }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155' }}>Phone Number</label>
                    <span style={{ fontSize: '9px', color: '#94a3b8' }}>SMS alerts</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '0 10px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#94a3b8', marginRight: '6px', fontSize: '12px' }}></span>
                    <input 
                      type="tel" 
                      placeholder="0909-009-0009"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 11))}
                      style={{ width: '100%', padding: '9px 0', border: 'none', backgroundColor: 'transparent', outline: 'none', fontSize: '11px', color: '#334155' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '6px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Password</label>
                  <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '0 10px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#94a3b8', marginRight: '6px', fontSize: '12px' }}></span>
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{ width: '100%', padding: '9px 0', border: 'none', backgroundColor: 'transparent', outline: 'none', fontSize: '11px', color: '#334155' }}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ cursor: 'pointer', marginLeft: '6px', display: 'flex', alignItems: 'center' }}
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

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Confirm Password</label>
                  <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '0 10px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#94a3b8', marginRight: '6px', fontSize: '12px' }}></span>
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      style={{ width: '100%', padding: '9px 0', border: 'none', backgroundColor: 'transparent', outline: 'none', fontSize: '11px', color: '#334155' }}
                    />
                    <span
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ cursor: 'pointer', marginLeft: '6px', display: 'flex', alignItems: 'center' }}
                    >
                      {showConfirmPassword ? (
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
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ flex: 1, height: '3px', backgroundColor: '#e2e8f0', borderRadius: '2px', marginRight: '12px', overflow: 'hidden' }}>
                  <div style={{ width: '35%', height: '100%', backgroundColor: '#dc2626' }}></div>
                </div>
                <span style={{ fontSize: '9px', color: '#64748b' }}>At least 8 chars</span>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '8px' }}>
                  Primary Purpose & Role on Campus
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <label style={{ display: 'flex', gap: '8px', padding: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={isAdopting} onChange={(e) => setIsAdopting(e.target.checked)} style={{ accentColor: '#9E4624' }} />
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#0f172a' }}>I am Adopting</div>
                      <div style={{ fontSize: '9px', color: '#64748b' }}>Looking to foster or give a stray pet a home.</div>
                    </div>
                  </label>

                  <label style={{ display: 'flex', gap: '8px', padding: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={isReporting} onChange={(e) => setIsReporting(e.target.checked)} style={{ accentColor: '#9E4624' }} />
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#0f172a' }}>Reporting Strays</div>
                      <div style={{ fontSize: '9px', color: '#64748b' }}>Submitting GPS sightings & tracking lost animals.</div>
                    </div>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '20px' }}>
                <input type="checkbox" id="terms" checked={agreedTerms} onChange={(e) => setAgreedTerms(e.target.checked)} style={{ accentColor: '#9E4624', cursor: 'pointer' }} />
                <label htmlFor="terms" style={{ fontSize: '10px', color: '#64748b', cursor: 'pointer' }}>
                  I agree to humane rescue protocol, respectful campus communication, and RescuePaws' <a href="#terms" style={{ color: '#9E4624' }}>Terms of Care</a>.
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
                  padding: '11px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '12px',
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? 'Creating Account...' : 'Create Account →'}
              </button>
            </form>
          </div>

          <div style={{ textAlign: 'center', fontSize: '11px', color: '#64748b', marginTop: '14px' }}>
            Already have an account? <span onClick={() => navigate('/login')} style={{ color: '#9E4624', fontWeight: '700', cursor: 'pointer' }}>Sign In</span>
          </div>
        </div>
      </div>

      {showSuccessModal && (
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
            padding: '36px 32px',
            width: '100%',
            maxWidth: '380px',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>
              Successfully Signed-up!
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 24px 0' }}>
              Your account has been created. You can now log in to get started.
            </p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                width: '100%',
                backgroundColor: '#9E4624',
                color: '#ffffff',
                border: 'none',
                padding: '11px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Continue to Login →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
