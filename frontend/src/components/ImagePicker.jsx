import React, { useRef, useState } from 'react';
import { api } from '../api';
import Icon from './Icons';

// Lets the user choose a photo, shrinks it in the browser (so it is small and fast),
// uploads it to the backend, and gives the saved photo URL to the parent through onChange(url).
const MAX_SIDE = 1200;

function shrink(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That file is not a photo we can read')); };
    img.src = url;
  });
}

export default function ImagePicker({ value, onChange, label = 'Photo' }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const choose = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setBusy(true);
    try {
      const image = await shrink(file);
      const { url } = await api('/uploads', { method: 'POST', body: { image } });
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div style={{ fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>{label}</div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={choose} style={{ display: 'none' }} />
      {value ? (
        <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
          <img src={value} alt="Chosen" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
          <button type="button" aria-label="Remove photo" onClick={() => onChange('')} style={{ position: 'absolute', top: '6px', right: '6px', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', background: 'rgba(15,23,42,0.75)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="x" size={14} /></button>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current.click()} disabled={busy} style={{ width: '100%', padding: '22px 12px', border: '2px dashed #cbd5e1', borderRadius: '8px', background: '#f8fafc', color: '#64748b', fontSize: '13px', cursor: busy ? 'wait' : 'pointer' }}>
          {busy ? 'Uploading...' : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Icon name="camera" size={18} /> Click to choose a photo</span>}
        </button>
      )}
      {error && <div style={{ color: '#b91c1c', fontSize: '12px', marginTop: '6px' }}>{error}</div>}
    </div>
  );
}
