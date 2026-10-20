import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api';
import Icon from './Icons';
import Modal from './Modal';
import './Navbar.css';

const POLL_MS = 15000;

export default function Navbar({ isLoggedIn, onLogout, user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const menuRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  const confirmLogout = () => {
    setLogoutConfirmOpen(false);
    onLogout();
    navigate('/login');
  };

  // The red dot follows the real unread count: it appears when something new arrives and disappears once it is read.
  const refresh = useCallback(() => {
    if (!isLoggedIn) { setUnread(0); return; }
    api('/notifications/unread-count').then((r) => setUnread(r.unreadCount || 0)).catch(() => {});
  }, [isLoggedIn]);

  useEffect(() => {
    refresh();
    if (!isLoggedIn) return undefined;
    const timer = window.setInterval(refresh, POLL_MS);
    const onFocus = () => refresh();
    window.addEventListener('notifications:changed', onFocus);
    window.addEventListener('focus', onFocus);
    return () => { window.clearInterval(timer); window.removeEventListener('notifications:changed', onFocus); window.removeEventListener('focus', onFocus); };
  }, [isLoggedIn, refresh, location.pathname]);

  useEffect(() => { setNavOpen(false); setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const link = (path, label) => (
    <button type="button" className={`nav__link${isActive(path) ? ' nav__link--on' : ''}`} onClick={() => navigate(path)}>{label}</button>
  );

  return (
    <header className="nav">
      <div className="nav__inner">
        <div className="nav__left">
          <button type="button" className="nav__logo" onClick={() => navigate('/')} aria-label="RescuePaws home">
            <span className="nav__logo-mark"><Icon name="paw" size={18} /></span>
            <span className="nav__logo-text">RescuePaws</span>
          </button>
          <nav className={`nav__links${navOpen ? ' is-open' : ''}`} aria-label="Main">
            {link('/', 'Home')}
            {link('/browse', 'Browse')}
            {link('/post', 'Post')}
          </nav>
        </div>

        <div className="nav__right">
          {isLoggedIn ? (
            <>
              <button type="button" className={`nav__bell${isActive('/notifications') ? ' nav__bell--on' : ''}`} onClick={() => navigate('/notifications')}
                aria-label={unread > 0 ? `Notifications, ${unread} new` : 'Notifications'} title="Notifications">
                <Icon name="bell" size={19} />
                {unread > 0 && <span className="nav__dot">{unread > 9 ? '9+' : unread}</span>}
              </button>

              <div className="nav__user" ref={menuRef}>
                <button type="button" className="nav__user-btn" onClick={() => setMenuOpen((o) => !o)} aria-haspopup="menu" aria-expanded={menuOpen}>
                  {user?.avatar
                    ? <img className="rp-avatar" src={user.avatar} alt="" style={{ width: 36, height: 36 }} />
                    : <span className="rp-avatar" style={{ width: 36, height: 36, fontSize: 14 }}>{user?.name ? user.name[0].toUpperCase() : '?'}</span>}
                  <span className="nav__user-name">{user?.name}</span>
                </button>
                {menuOpen && (
                  <div className="nav__menu" role="menu">
                    <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); navigate('/profile'); }}><Icon name="user" size={16} /> My Profile</button>
                    <button type="button" role="menuitem" className="is-danger" onClick={() => { setMenuOpen(false); setLogoutConfirmOpen(true); }}><Icon name="logout" size={16} /> Log Out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="nav__auth">
              <button type="button" className="rp-btn rp-btn--ghost rp-btn--sm" onClick={() => navigate('/login')}>Log In</button>
              <button type="button" className="rp-btn rp-btn--primary rp-btn--sm" onClick={() => navigate('/register')}>Sign Up</button>
            </div>
          )}
          <button type="button" className="nav__burger" onClick={() => setNavOpen((o) => !o)} aria-label="Menu" aria-expanded={navOpen}><Icon name={navOpen ? 'x' : 'menu'} size={20} /></button>
        </div>
      </div>
      {logoutConfirmOpen && createPortal(
        <Modal
          title="Log out?"
          subtitle="Are you sure you want to log out?"
          icon="logout"
          onClose={() => setLogoutConfirmOpen(false)}
          footer={(
            <>
              <button type="button" className="rp-btn rp-btn--ghost" autoFocus onClick={() => setLogoutConfirmOpen(false)}>Cancel</button>
              <button type="button" className="rp-btn rp-btn--solid-danger" onClick={confirmLogout}>Sure</button>
            </>
          )}
        />,
        document.body,
      )}
    </header>
  );
}
