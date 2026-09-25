import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AdminOverview from './pages/AdminOverview';
import SightingsModeration from './pages/SightingsModeration';
import AdoptionReviews from './pages/AdoptionReviews';
import ManageUsers from './pages/ManageUsers';
import AdminProfile from './pages/AdminProfile';
import AdminNotifications from './pages/AdminNotifications';

// Where to send people who aren't allowed in here.
const MAIN_SITE_URL = 'http://localhost:5173';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [authState, setAuthState] = useState('checking'); // checking | authorized | denied
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    async function verifyAdmin() {
      // If we just arrived from the main site's login redirect, it'll have
      // put the token in the URL as ?token=... — grab it and store it here,
      // since localStorage on port 5173 isn't visible on port 5174.
      const params = new URLSearchParams(window.location.search);
      const tokenFromUrl = params.get('token');
      if (tokenFromUrl) {
        localStorage.setItem('adminToken', tokenFromUrl);
        // Clean the token out of the visible URL so it's not sitting in
        // browser history / bookmarks.
        window.history.replaceState({}, '', window.location.pathname);
      }

      const token = localStorage.getItem('adminToken');
      if (!token) {
        setAuthState('denied');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          localStorage.removeItem('adminToken');
          setAuthState('denied');
          return;
        }

        const user = await response.json();

        if (!user.roles || !user.roles.includes('admin')) {
          localStorage.removeItem('adminToken');
          setAuthState('denied');
          return;
        }

        setAdminUser(user);
        setAuthState('authorized');
      } catch (err) {
        setAuthState('denied');
      }
    }

    verifyAdmin();
  }, []);

  if (authState === 'checking') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', color: '#64748b' }}>
        Checking admin access...
      </div>
    );
  }

  if (authState === 'denied') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', gap: '16px', padding: '20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '22px', color: '#0f172a' }}>Admin access required</h1>
        <p style={{ color: '#64748b', maxWidth: '360px' }}>
          You need to log in with an admin account on the main RescuePaws site to view this dashboard.
        </p>
        <a
          href={MAIN_SITE_URL + '/login'}
          style={{ backgroundColor: '#9E4624', color: '#fff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: '700', fontSize: '14px' }}
        >
          Go to Login →
        </a>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} adminUser={adminUser} />

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
        {activeTab === 'overview' && <AdminOverview setActiveTab={setActiveTab} />}
        {activeTab === 'sightings' && <SightingsModeration />}
        {activeTab === 'adoptions' && <AdoptionReviews />}
        {activeTab === 'users' && <ManageUsers />}
        {activeTab === 'profile' && <AdminProfile />}
        {activeTab === 'admin-notifications' && <AdminNotifications />}
      </main>
    </div>
  );
}
