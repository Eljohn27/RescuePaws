import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icons';
import './ImagePreview.css';

export default function ImagePreview({ src, alt, onClose }) {
  if (!src) return null;

  return createPortal(
    <ImageViewer src={src} alt={alt} onClose={onClose} />,
    document.body
  );
}

function ImageViewer({ src, alt, onClose }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="rp-image-viewer" role="dialog" aria-modal="true" aria-label={alt || 'Photo preview'} onClick={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <button type="button" className="rp-image-viewer__close" onClick={onClose} aria-label="Close photo">
        <Icon name="x" size={21} />
      </button>
      <img className="rp-image-preview" src={src} alt={alt || 'Post photo'} />
    </div>
  );
}
