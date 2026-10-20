import React, { useState } from 'react';
import Modal from './Modal';

// The pop-up in the middle of the screen for rejecting or taking something down.
// A reason is required because the person is sent that exact message.
export default function ReasonModal({ title, subtitle, confirmLabel = 'Confirm', tone = 'bad', onCancel, onConfirm }) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const ready = reason.trim().length >= 3;

  const submit = async (e) => {
    e.preventDefault();
    if (!ready || busy) return;
    setBusy(true);
    setError('');
    try {
      await onConfirm(reason.trim());
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <Modal title={title} subtitle={subtitle} icon="flag" tone={tone} onClose={busy ? undefined : onCancel} locked={busy} maxWidth={440}>
      <form onSubmit={submit}>
        <div className="rp-field">
          <div className="rp-label__row">
            <label className="rp-label" htmlFor="reason-text">Message to the user <span className="rp-req">*</span></label>
            <span className="rp-counter">{reason.length}/500</span>
          </div>
          <textarea id="reason-text" className="rp-input" autoFocus value={reason} maxLength={500} onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why, so the user knows what to fix. They will receive this as a notification." />
          {reason.length > 0 && !ready && <div className="rp-error">Write at least 3 characters.</div>}
        </div>
        {error && <div className="rp-alert rp-alert--bad" role="alert">{error}</div>}
        <div className="rp-modal__footer" style={{ marginTop: 6 }}>
          <button type="button" className="rp-btn rp-btn--ghost" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="submit" className="rp-btn rp-btn--solid-danger" disabled={!ready || busy}>{busy ? 'Sending...' : confirmLabel}</button>
        </div>
      </form>
    </Modal>
  );
}
