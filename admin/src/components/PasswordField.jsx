import React, { useId, useState } from 'react';
import Icon from './Icons';
import { PASSWORD_MAX, cleanPassword, passwordChecks } from '../utils/validators';

// Password box with a show / hide button. Spaces can never be typed or pasted (except `lenient`, used only on the
// login form so people whose old password has a space can still sign in).
export default function PasswordField({ label, value, onChange, placeholder = '••••••••', autoComplete, required = true, meter = false, error, id, lenient = false }) {
  const auto = useId();
  const inputId = id || auto;
  const [show, setShow] = useState(false);
  const checks = passwordChecks(value);
  const passed = checks.filter((c) => c.ok).length;
  const level = !value ? 0 : passed;
  const tone = level <= 1 ? 'weak' : level === 2 ? 'fair' : level === 3 ? 'good' : 'strong';
  const word = ['', 'Weak', 'Weak', 'Fair', 'Strong'][level] || '';

  return (
    <div className="rp-field">
      {label && <label className="rp-label" htmlFor={inputId}>{label}{required && <span className="rp-req"> *</span>}</label>}
      <div className={`rp-input-wrap${error ? ' rp-input-wrap--error' : ''}`}>
        <Icon name="lock" size={16} className="rp-input-wrap__icon" />
        <input
          id={inputId}
          className="rp-input rp-input--bare"
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(lenient ? e.target.value : cleanPassword(e.target.value))}
          onKeyDown={(e) => { if (!lenient && e.key === ' ') e.preventDefault(); }}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={lenient ? 72 : PASSWORD_MAX}
          required={required}
        />
        <button type="button" className="rp-input-wrap__toggle" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}>
          <Icon name={show ? 'eyeOff' : 'eye'} size={17} />
        </button>
      </div>
      {meter && (
        <div className="rp-meter" aria-live="polite">
          <div className="rp-meter__row">
            <div className="rp-meter__bar" role="progressbar" aria-valuemin={0} aria-valuemax={4} aria-valuenow={level} aria-label="Password strength">
              <div className={`rp-meter__fill rp-meter__fill--${tone}`} style={{ width: `${(level / 4) * 100}%` }} />
            </div>
            <span className={`rp-meter__word rp-meter__word--${tone}`}>{word || 'Strength'}</span>
            <span className="rp-counter">{value.length}/{PASSWORD_MAX}</span>
          </div>
          <ul className="rp-meter__list">
            {checks.map((c) => (
              <li key={c.label} className={c.ok ? 'is-ok' : ''}><Icon name={c.ok ? 'check' : 'x'} size={12} stroke={3} /> {c.label}</li>
            ))}
          </ul>
        </div>
      )}
      {error && <div className="rp-error" role="alert">{error}</div>}
    </div>
  );
}
