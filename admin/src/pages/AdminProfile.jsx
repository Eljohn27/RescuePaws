import React, { useState } from 'react';

export default function AdminProfile() {
  const [isEditing, setIsEditing] = useState(false);

  const [profileData, setProfileData] = useState({
    name: 'Elena Rostova',
    role: 'Admin',
    email: 'elena.rostova@rescuepaws.org',
    memberSince: 'Jan 2023',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    stats: {
      petsRescued: { count: 89, subtext: 'Rehomed or adopted' },
      activeSightings: { count: 14, subtext: 'Open reports' },
      fosterPlacements: { count: 42, subtext: 'In community care' },
      reviewsDone: { count: 28, subtext: 'This month' },
    },
    pendingTasksCount: 3,
    recentTasks: [
      { id: 1, title: 'Review Adoption Application #104', type: 'Adoption', date: 'Today, 10:30 AM', status: 'Pending' },
      { id: 2, title: 'Approve Sightings Report for Quezon City', type: 'Moderation', date: 'Yesterday, 4:15 PM', status: 'In Progress' },
      { id: 3, title: 'Verify Foster Placement for Buster', type: 'Foster', date: 'Oct 14, 2024', status: 'Pending' },
    ]
  });

  const [formData, setFormData] = useState({
    name: profileData.name,
    email: profileData.email,
    newPassword: '',
    confirmPassword: '',
  });

  const handleOpenEdit = () => {
    setFormData({
      name: profileData.name,
      email: profileData.email,
      newPassword: '',
      confirmPassword: '',
    });
    setIsEditing(true);
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    setProfileData((prev) => ({
      ...prev,
      name: formData.name,
      email: formData.email,
    }));

    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  // Reusable CSS style para sa malinis na Input fields
  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
  };

  return (
    <div style={{ textAlign: 'left', width: '100%', maxWidth: '1100px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* TOP HEADER CARD */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* USER INFO */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <img 
              src={profileData.avatar} 
              alt={profileData.name} 
              style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} 
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
                  {profileData.name}
                </h1>
                <span style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '12px', padding: '3px 10px', borderRadius: '12px', fontWeight: '600' }}>
                  {profileData.role}
                </span>
              </div>
              
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
                {profileData.email} • Member since {profileData.memberSince} • <span style={{ color: '#16a34a', fontWeight: '600' }}>{profileData.status}</span>
              </div>
            </div>
          </div>

          {/* EDIT BUTTON */}
          <button 
            type="button"
            onClick={handleOpenEdit}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              backgroundColor: '#ffffff', 
              border: '1px solid #cbd5e1', 
              padding: '8px 16px', 
              borderRadius: '8px', 
              fontSize: '13px', 
              fontWeight: '600', 
              color: '#334155', 
              cursor: 'pointer' 
            }}
          >
            ✏️ Edit Profile
          </button>
        </div>

        {/* STATS CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '28px' }}>
          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Pets Rescued</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>{profileData.stats.petsRescued.count}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{profileData.stats.petsRescued.subtext}</div>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Active Sightings</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>{profileData.stats.activeSightings.count}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{profileData.stats.activeSightings.subtext}</div>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Foster Placements</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>{profileData.stats.fosterPlacements.count}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{profileData.stats.fosterPlacements.subtext}</div>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Reviews Done</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>{profileData.stats.reviewsDone.count}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{profileData.stats.reviewsDone.subtext}</div>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY & ASSIGNED TASKS SECTION */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
            Recent Activity &amp; Assigned Tasks
          </h2>
          <span style={{ fontSize: '12px', color: '#a34828', backgroundColor: '#fff7ed', padding: '4px 10px', borderRadius: '12px', fontWeight: '600' }}>
            {profileData.pendingTasksCount} pending tasks
          </span>
        </div>

        {/* LIST OF TASKS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {profileData.recentTasks.map((task) => (
            <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{task.title}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{task.type} • {task.date}</div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: task.status === 'Pending' ? '#c2410c' : '#0284c7', backgroundColor: task.status === 'Pending' ? '#ffedd5' : '#e0f2fe', padding: '4px 8px', borderRadius: '6px' }}>
                {task.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL EDIT PROFILE WITH CLEAN LIGHT INPUTS */}
      {isEditing && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 9999,
          padding: '16px',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            width: '100%',
            maxWidth: '440px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            boxSizing: 'border-box',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>Edit Profile Details</h3>
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>
                  Full Name
                </label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>
                  Email Address
                </label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>

              <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#a34828' }}>🔒 Change Password (Optional)</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>
                  New Password
                </label>
                <input 
                  type="password" 
                  placeholder="Leave blank to keep current password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>
                  Confirm New Password
                </label>
                <input 
                  type="password" 
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#475569', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#a34828', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}