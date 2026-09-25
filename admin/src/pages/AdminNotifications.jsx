import React, { useState } from 'react';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New Adoption Application',
      message: 'Alex Vance submitted an application to adopt Buster.',
      time: '10 minutes ago',
      category: 'Adoption',
      unread: true,
    },
    {
      id: 2,
      title: 'Sighting Moderation Required',
      message: 'New stray dog report in Barangay Central needs approval.',
      time: '1 hour ago',
      category: 'Sightings',
      unread: true,
    },
    {
      id: 3,
      title: 'System Backup Success',
      message: 'Automated weekly database backup finished without errors.',
      time: '4 hours ago',
      category: 'System',
      unread: false,
    },
    {
      id: 4,
      title: 'Volunteer Application',
      message: 'Maria Santos registered as a rescue driver volunteer.',
      time: '1 day ago',
      category: 'Volunteer',
      unread: false,
    },
  ]);

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((item) =>
        item.id === id ? { ...item, unread: false } : item
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((item) => ({ ...item, unread: false }))
    );
  };

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
            Admin Notifications
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>
            Recent updates, adoption requests, and system activity logs.
          </p>
        </div>
        <button
          onClick={markAllAsRead}
          style={{
            padding: '8px 14px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Mark all as read
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {notifications.map((item) => (
          <div
            key={item.id}
            onClick={() => markAsRead(item.id)}
            style={{
              padding: '16px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              backgroundColor: item.unread ? '#fff7ed' : '#ffffff',
              borderLeft: item.unread ? '4px solid #a34828' : '1px solid #e2e8f0',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'flex-start',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                  }}
                >
                  {item.category}
                </span>
                <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a' }}>
                  {item.title}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#475569', margin: '4px 0' }}>
                {item.message}
              </p>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>{item.time}</span>
            </div>

            {item.unread && (
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#a34828',
                  borderRadius: '50%',
                  marginTop: '6px',
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}