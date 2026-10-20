import React, { useId } from 'react';

// 6-digit code box (numbers only).
export default function OtpField({ value, onChange, label = 'Verification code', id }) {
  const auto = useId();
  const inputId = id || auto;
  return (
    <div className="rp-field">
      <label className="rp-label" htmlFor={inputId}>{label}<span className="rp-req"> *</span></label>
      <input
        id={inputId}
        className="rp-input rp-otp"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]{6}"
        maxLength={6}
        required
        placeholder="000000"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
      />
    </div>
  );
}
