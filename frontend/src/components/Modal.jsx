import React, { useEffect } from 'react';
import Icon from './Icons';

// A small pop-up in the middle of the screen. Click outside or press Escape to close (unless `locked`).
export default function Modal({ title, subtitle, icon, tone = 'brand', onClose, locked = false, maxWidth = 440, children, footer }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !locked && onClose?.();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose, locked]);

  return (
    <div className="rp-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget && !locked) onClose?.(); }}>
      <div className="rp-modal" role="dialog" aria-modal="true" aria-label={title} style={{ maxWidth }}>
        {!locked && onClose && (
          <button type="button" className="rp-modal__close" onClick={onClose} aria-label="Close"><Icon name="x" size={16} /></button>
        )}
        {icon && <div className={`rp-modal__icon rp-modal__icon--${tone}`}><Icon name={icon} size={24} /></div>}
        {title && <h3 className="rp-modal__title">{title}</h3>}
        {subtitle && <p className="rp-modal__subtitle">{subtitle}</p>}
        <div className="rp-modal__body">{children}</div>
        {footer && <div className="rp-modal__footer">{footer}</div>}
      </div>
    </div>
  );
}
