import React from 'react';
import Modal from './Modal';

// The "Terms of Care" pop-up (terms and agreement) shown from the sign-up page.
export default function TermsModal({ onClose, onAgree }) {
  return (
    <Modal
      title="Terms of Care"
      subtitle="Terms and agreement"
      icon="shield"
      onClose={onClose}
      maxWidth={460}
      footer={(
        <>
          <button type="button" className="rp-btn rp-btn--ghost" onClick={onClose}>Close</button>
          {onAgree && <button type="button" className="rp-btn rp-btn--primary" onClick={onAgree}>I agree</button>}
        </>
      )}
    >
      <div className="rp-terms">
        <p>By creating a RescuePaws account you agree to:</p>
        <ol>
          <li><strong>Treat every animal humanely.</strong> Never harm, tease, abandon or sell an animal through this site.</li>
          <li><strong>Post only true information.</strong> Photos, locations and details must be real and your own. Every post is reviewed by an admin before it goes live.</li>
          <li><strong>Be respectful.</strong> Communicate kindly with other members and never share anyone's private details.</li>
          <li><strong>Adopt responsibly.</strong> Give an adopted pet food, shelter, vet care and a safe home for life.</li>
          <li><strong>Accept moderation.</strong> Posts that break these terms can be rejected or taken down, and accounts that repeatedly do so can be removed.</li>
        </ol>
        <p className="rp-terms__note">We use your email and phone number only to run RescuePaws and to contact you about your posts and adoption requests.</p>
      </div>
    </Modal>
  );
}
