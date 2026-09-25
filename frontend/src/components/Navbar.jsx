import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api';

const BRAND = '#9E4624';

export default function Navbar({ isLoggedIn, onLogout, user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [pending, setPending] = useState(0); // adoption requests waiting for this user's answer
  const [showDropdown, setShowDropdown] = useState(false);

  const isActive = (path) => location.pathname === path;

  // Refresh the bell number every time the user moves to another page.
  useEffect(() => {
    if (!isLoggedIn) { setPending(0); return; }
    api('/applications/received')
      .then((list) => setPending(list.filter((a) => a.status === 'Needs Review').length))
      .catch(() => {});
  }, [isLoggedIn, location.pathname]);

  const link = (path, label) => (
    <button
      onClick={() => navigate(path)}
      style={{
        padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px',
        backgroundColor: isActive(path) ? '#fff7ed' : 'transparent',
        color: isActive(path) ? BRAND : '#64748b',
        fontWeight: isActive(path) ? '700' : '500',
      }}
    >
      {label}
    </button>
  );

  return (
    <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 1000, padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <div style={{ backgroundColor: BRAND, color: '#fff', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🐾</div>
          <span style={{ fontWeight: '800', fontSize: '18px', color: '#0f172a' }}>RescuePaws</span>
        </div>
        <nav style={{ display: 'flex', gap: '4px' }}>
          {link('/', 'Home')}
          {link('/browse', 'Browse')}
          {link('/post', 'Post')}
        </nav>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {isLoggedIn ? (
          <>
            <div style={{ position: 'relative' }}>
              <button onClick={() => navigate('/notifications')} title="Adoption requests" style={{ background: isActive('/notifications') ? '#fff7ed' : '#f1f5f9', border: isActive('/notifications') ? `1px solid ${BRAND}` : 'none', width: '38px', height: '38px', borderRadius: '50%', fontSize: '16px', cursor: 'pointer' }}>🔔</button>
              {pending > 0 && (
                <span style={{ position: 'absolute', top: '1px', right: '1px', backgroundColor: '#ef4444', color: '#fff', fontSize: '9px', fontWeight: 'bold', borderRadius: '10px', padding: '1px 5px', border: '2px solid #fff' }}>{pending}</span>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <div onClick={() => setShowDropdown(!showDropdown)} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: BRAND, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                  {user?.name ? user.name[0].toUpperCase() : '?'}
                </div>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>{user?.name}</span>
                <span style={{ fontSize: '10px', color: '#64748b' }}>▼</span>
              </div>
              {showDropdown && (
                <div style={{ position: 'absolute', right: 0, top: '46px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '150px', overflow: 'hidden' }}>
                  <button onClick={() => { navigate('/profile'); setShowDropdown(false); }} style={{ width: '100%', padding: '10px 12px', border: 'none', background: 'transparent', color: '#334155', fontWeight: '600', fontSize: '12px', textAlign: 'left', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>👤 My Profile</button>
                  <button onClick={() => { setShowDropdown(false); onLogout(); navigate('/login'); }} style={{ width: '100%', padding: '10px 12px', border: 'none', background: 'transparent', color: '#ef4444', fontWeight: '700', fontSize: '12px', textAlign: 'left', cursor: 'pointer' }}>🚪 Log Out</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => navigate('/login')} style={{ padding: '7px 14px', border: 'none', background: 'transparent', color: BRAND, fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>Log In</button>
            <button onClick={() => navigate('/register')} style={{ padding: '7px 14px', border: 'none', backgroundColor: BRAND, color: '#fff', borderRadius: '6px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>Sign Up</button>
          </div>
        )}
      </div>
    </header>
  );
}
