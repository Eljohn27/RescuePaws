import React, { useState } from 'react';
import Modal from './Modal';

export default function DeletePostModal({ postName, postType, onCancel, onConfirm }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const confirm = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await onConfirm();
    } catch (err) {
      setError(err.message || 'Could not delete this post.');
      setBusy(false);
    }
  };

  return (
    <Modal
      title="Permanently delete this post?"
      subtitle={`“${postName}” will be removed from the website and admin list. Related reports, applications, or rescue proof records will also be removed when applicable. This cannot be undone.`}
      icon="trash"
      tone="bad"
      onClose={busy ? undefined : onCancel}
      locked={busy}
      maxWidth={460}
      footer={(
        <>
          <button type="button" className="rp-btn rp-btn--ghost" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="button" className="rp-btn rp-btn--solid-danger" onClick={confirm} disabled={busy}>
            {busy ? 'Deleting…' : 'Delete permanently'}
          </button>
        </>
      )}
    >
      {error && <div className="rp-alert rp-alert--bad" role="alert">{error}</div>}
      <p className="rp-hint" style={{ marginBottom: 0 }}>Post type: {postType}</p>
    </Modal>
  );
}
