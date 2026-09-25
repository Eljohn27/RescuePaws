import React, { useEffect, useState } from 'react';
import { api } from '../api';

const field = { width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' };
const small = (bg, color = '#fff', border = 'none') => ({ backgroundColor: bg, color, border, padding: '5px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' });
const when = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null); // the user being edited
  const [form, setForm] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [message, setMessage] = useState({ text: '', bad: false });

  const say = (text, bad = false) => {
    setMessage({ text, bad });
    setTimeout(() => setMessage({ text: '', bad: false }), 3500);
  };

  const load = async () => {
    try { setUsers((await api('/admin/users?limit=100')).users); }
    catch (e) { say(e.message, true); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const startEdit = (u) => { setEditing(u); setForm({ name: u.name, phone: u.phone || '' }); setFormError(''); };

  const save = async () => {
    setSaving(true); setFormError('');
    try {
      await api(`/admin/users/${editing._id}`, { method: 'PATCH', body: form });
      setEditing(null);
      say('User updated.');
      load();
    } catch (e) { setFormError(e.message); }
    finally { setSaving(false); }
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.name}?\n\nTheir account, requests and proofs are removed. Their posts stay on the site.`)) return;
    try { await api(`/admin/users/${u._id}`, { method: 'DELETE' }); say('User deleted.'); load(); }
    catch (e) { say(e.message, true); }
  };

  const q = search.trim().toLowerCase();
  const shown = users.filter((u) => !q || `${u.name} ${u.email}`.toLowerCase().includes(q));
  const th = { textAlign: 'left', padding: '10px 14px', fontSize: '12px', color: '#64748b', fontWeight: '700', borderBottom: '1px solid #e2e8f0' };
  const td = { padding: '12px 14px', fontSize: '13px', color: '#334155', borderBottom: '1px solid #f1f5f9' };

  return (
    <div style={{ textAlign: 'left', padding: '10px 0', width: '100%' }}>
      <div style={{ marginBottom: '15px' }}>
        <h2 style={{ margin: '5px 0', fontSize: '22px', color: '#1e293b' }}>Manage Users</h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Edit a user's name or phone, or remove an account.</p>
      </div>

      {message.text && (
        <div style={{ marginBottom: '12px', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', backgroundColor: message.bad ? '#fee2e2' : '#dcfce7', color: message.bad ? '#b91c1c' : '#166534' }}>{message.text}</div>
      )}

      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." style={{ ...field, maxWidth: '320px', marginBottom: '16px' }} />

      {loading && <p style={{ color: '#64748b' }}>Loading...</p>}
      {!loading && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><th style={th}>Name</th><th style={th}>Email</th><th style={th}>Phone</th><th style={th}>Role</th><th style={th}>Joined</th><th style={th}></th></tr>
            </thead>
            <tbody>
              {shown.length === 0 && <tr><td style={td} colSpan={6}>No users found.</td></tr>}
              {shown.map((u) => {
                const isAdmin = u.roles.includes('admin');
                return (
                  <tr key={u._id}>
                    <td style={{ ...td, fontWeight: '600', color: '#0f172a' }}>{u.name}</td>
                    <td style={td}>{u.email}</td>
                    <td style={td}>{u.phone || '-'}</td>
                    <td style={td}>
                      <span style={{ background: isAdmin ? '#fef3c7' : '#f1f5f9', color: isAdmin ? '#92400e' : '#475569', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>{isAdmin ? 'Admin' : 'Member'}</span>
                    </td>
                    <td style={td}>{when(u.createdAt)}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>
                      <button onClick={() => startEdit(u)} style={{ ...small('#9a3412'), marginRight: '6px' }}>Edit</button>
                      <button onClick={() => remove(u)} style={small('#fff', '#b91c1c', '1px solid #fca5a5')}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div onClick={() => setEditing(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: '12px', padding: '22px', width: '100%', maxWidth: '380px' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '18px', color: '#0f172a' }}>Edit user</h3>
            <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#64748b' }}>{editing.email}</p>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', margin: '12px 0 6px' }}>Full name</label>
            <input style={field} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', margin: '12px 0 6px' }}>Phone (11 digits)</label>
            <input style={field} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            {formError && <div style={{ color: '#b91c1c', fontSize: '12px', marginTop: '10px' }}>{formError}</div>}
            <div style={{ display: 'flex', gap: '8px', marginTop: '18px' }}>
              <button onClick={save} disabled={saving} style={{ ...small('#9a3412'), padding: '9px 18px', opacity: saving ? 0.6 : 1 }}>{saving ? 'Saving...' : 'Save'}</button>
              <button onClick={() => setEditing(null)} style={{ ...small('#fff', '#475569', '1px solid #cbd5e1'), padding: '9px 18px' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
