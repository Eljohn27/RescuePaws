import React from 'react';
import Icon from './Icons';

export default function Navbar({ activeTab, setActiveTab, unread = 0, unreadMessages = 0, openReports = 0, onLogout }) {
  const tabs = [
    { id: 'overview', label: 'Admin Dashboard' },
    { id: 'sightings', label: 'Sightings Moderation' },
    { id: 'adoptions', label: 'Foster Posts' },
    { id: 'reports', label: 'Reported Posts', badge: openReports },
    { id: 'users', label: 'Manage Users' },
  ];

  return (
    <header className="an">
      <div className="an__inner">
        <div className="an__brand">
          <span className="an__logo"><Icon name="paw" size={18} /></span>
          <strong>RescuePaws</strong>
          <span className="an__tag">ADMIN</span>
        </div>

        <nav className="an__tabs" aria-label="Admin sections">
          {tabs.map((tab) => (
            <button type="button" key={tab.id} className={`an__tab${activeTab === tab.id ? ' is-on' : ''}`} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
              {tab.badge > 0 && <span className="an__count">{tab.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="an__right">
          {/* The red dot is only there while something is unread, and goes away once it has been read. */}
          <button type="button" className={`an__icon${activeTab === 'admin-notifications' ? ' is-on' : ''}`} onClick={() => setActiveTab('admin-notifications')}
            aria-label={unread > 0 ? `Notifications, ${unread} new` : 'Notifications'} title="Notifications">
            <Icon name="bell" size={18} />
            {unread > 0 && <span className="an__dot">{unread > 9 ? '9+' : unread}</span>}
          </button>
          <button type="button" className={`an__icon${activeTab === 'messages' ? ' is-on' : ''}`} onClick={() => setActiveTab('messages')}
            aria-label={unreadMessages > 0 ? `Inbox, ${unreadMessages} unread messages` : 'Inbox'} title="Inbox">
            <Icon name="mail" size={18} />
            {unreadMessages > 0 && <span className="an__dot">{unreadMessages > 9 ? '9+' : unreadMessages}</span>}
          </button>
          <button type="button" className={`an__icon${activeTab === 'profile' ? ' is-on' : ''}`} onClick={() => setActiveTab('profile')} aria-label="My profile" title="My profile"><Icon name="user" size={18} /></button>
          <button type="button" className="an__icon" onClick={onLogout} aria-label="Log out" title="Log out"><Icon name="logout" size={18} /></button>
        </div>
      </div>
    </header>
  );
}
