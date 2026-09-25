import React, { useEffect, useState } from 'react';
import { Users, Eye, Home, CheckCircle2, LayoutGrid } from 'lucide-react';
import { api } from '../api';

const card = { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', textAlign: 'left' };

export default function AdminOverview({ setActiveTab }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/admin/stats').then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <p style={{ color: '#b91c1c' }}>Could not load the dashboard: {error}</p>;
  if (!stats) return <p style={{ color: '#64748b' }}>Loading...</p>;

  const c = stats.counters;
  const cards = [
    { title: 'Users', count: c.users, sub: 'Registered accounts', icon: <Users size={20} color="#0369a1" />, bg: '#e0f2fe' },
    { title: 'Sightings', count: c.sightings, sub: 'All stray reports', icon: <Eye size={20} color="#c2410c" />, bg: '#ffedd5' },
    { title: 'Fosters', count: c.fosters, sub: 'Pets posted for adoption', icon: <Home size={20} color="#d97706" />, bg: '#fef3c7' },
    { title: 'Rescued', count: c.rescued, sub: 'Strays rescued', icon: <CheckCircle2 size={20} color="#059669" />, bg: '#d1fae5' },
    { title: 'On Browse', count: c.onBrowse, sub: 'Posts visible to the public', icon: <LayoutGrid size={20} color="#7c3aed" />, bg: '#ede9fe' },
  ];

  const pendingSightings = stats.sightings.byModeration['Pending for Approval'] || 0;
  const pendingFosters = stats.adoptionPosts.byModeration['Pending for Approval'] || 0;
  const pendingProofs = (stats.proofs && stats.proofs['Needs Review']) || 0;
  const todo = [
    { label: 'Sighting reports waiting for approval', count: pendingSightings, tab: 'sightings' },
    { label: 'Foster posts waiting for approval', count: pendingFosters, tab: 'adoptions' },
    { label: 'Rescue proofs waiting for review', count: pendingProofs, tab: 'sightings' },
  ];

  return (
    <div style={{ padding: '8px 0', textAlign: 'left' }}>
      <div style={{ ...card, padding: '20px 24px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Admin Dashboard</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' }}>A quick look at everything happening in RescuePaws.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {cards.map((k) => (
          <div key={k.title} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>{k.title}</span>
              <div style={{ backgroundColor: k.bg, padding: '8px', borderRadius: '8px', display: 'flex' }}>{k.icon}</div>
            </div>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0 4px 0', color: '#0f172a' }}>{k.count}</h2>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{k.sub}</span>
          </div>
        ))}
      </div>

      <div style={{ ...card, padding: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0f172a' }}>Waiting for you</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {todo.map((t) => (
            <div key={t.label} style={{ padding: '14px 16px', borderRadius: '8px', border: '1px solid #f1f5f9', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#1e293b', fontSize: '14px' }}>
                <strong style={{ fontSize: '18px', marginRight: '8px' }}>{t.count}</strong>
                {t.label}
              </span>
              <button onClick={() => setActiveTab(t.tab)} style={{ backgroundColor: '#9a3412', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                Open
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
