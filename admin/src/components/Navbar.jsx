import React from 'react';

export default function Navbar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'overview', label: 'Admin Dashboard' },
    { id: 'sightings', label: 'Sightings Moderation' },
    { id: 'adoptions', label: 'Foster Posts' },
    { id: 'users', label: 'Manage Users' },
  ];

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 24px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        fontFamily: 'sans-serif',
      }}
    >
      {/* LOGO */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '24px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#a34828', // Terracotta Brown
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            color: '#ffffff',
            fontSize: '16px',
          }}
        >
          🐾
        </div>
        <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#0f172a' }}>
          RescuePaws
        </span>
        <span
          style={{
            backgroundColor: '#ffedd5',
            color: '#a34828',
            fontSize: '10px',
            fontWeight: 'bold',
            padding: '2px 6px',
            borderRadius: '4px',
            letterSpacing: '0.5px',
          }}
        >
          ADMIN
        </span>
      </div>

      {/* NAVIGATION TABS */}
      <nav style={{ display: 'flex', gap: '4px' }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: isActive ? '600' : '500',
                cursor: 'pointer',
                backgroundColor: isActive ? '#a34828' : 'transparent',
                color: isActive ? '#ffffff' : '#64748b',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* RIGHT SIDE: SEARCH BAR TO PROFILE */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
        {/* SEARCH BAR */}
        <div style={{ position: 'relative', width: '260px' }}>
          <span
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              fontSize: '13px',
            }}
          >
            🔍
          </span>
          <input
            type="text"
            placeholder="Search records, animals, volunteers..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              fontSize: '12px',
              color: '#0f172a',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* NOTIFICATION BUTTON (Pupunta sa AdminNotifications page) */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setActiveTab('admin-notifications')}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'admin-notifications' ? '#e2e8f0' : '#f1f5f9',
              color: '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              fontSize: '14px',
            }}
          >
            🔔
          </button>
          <span
            style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              width: '6px',
              height: '6px',
              backgroundColor: '#a34828',
              borderRadius: '50%',
            }}
          />
        </div>

        {/* PROFILE BUTTON */}
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#a34828',
            color: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          👤
        </button>
      </div>
    </header>
  );
}