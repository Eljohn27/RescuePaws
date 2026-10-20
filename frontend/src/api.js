// One place that talks to the backend. Every page uses this.
export const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174';

export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(API + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);

  if (res.status === 401 && token) {
    // Session expired or account changed: log out and go to the login page.
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Please log in again');
  }
  if (!res.ok) {
    const details = data && Array.isArray(data.errors) && data.errors.length ? data.errors.map((e) => e.msg).join('. ') : '';
    throw new Error(details || (data && data.message) || 'Something went wrong');
  }
  return data;
}

// For calls made while logged out (sign up, forgot password). Same error handling, no token, no auto-redirect.
export async function publicApi(path, body) {
  let res;
  try {
    res = await fetch(API + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  } catch {
    throw new Error('Could not reach the server. Is the backend running?');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const details = data && Array.isArray(data.errors) && data.errors.length ? data.errors.map((e) => e.msg).join('. ') : '';
    throw new Error(details || (data && data.message) || 'Something went wrong');
  }
  return data;
}

// Tells the navbar bell to refresh right away (after reading / receiving something).
export const pingNotifications = () => window.dispatchEvent(new Event('notifications:changed'));
