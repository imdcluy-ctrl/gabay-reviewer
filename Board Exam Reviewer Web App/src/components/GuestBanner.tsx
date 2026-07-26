import React, { useState } from 'react';
import { Button } from './Button';
import './GuestBanner.css';

interface GuestBannerProps {
  isGuest: boolean;
}

export const GuestBanner: React.FC<GuestBannerProps> = ({ isGuest }) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return sessionStorage.getItem('gabay_guest_banner_dismissed') === 'true';
  });

  const [showSheet, setShowSheet] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isGuest || isDismissed) return null;

  const handleDismissSession = () => {
    sessionStorage.setItem('gabay_guest_banner_dismissed', 'true');
    setIsDismissed(true);
    setShowSheet(false);
  };

  const handleCreateAccount = () => {
    setToastMessage('Account creation coming soon in Stage 4! 🚀');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <>
      <div className="guest-banner">
        <span>📱 Progress saved on this device only · </span>
        <button className="guest-banner-link" onClick={() => setShowSheet(true)}>
          Back up your progress →
        </button>
      </div>

      {showSheet && (
        <div className="guest-modal-backdrop">
          <div className="guest-modal-sheet">
            <span className="guest-modal-icon">📱</span>
            <h3>Back Up Your Progress</h3>
            <p>
              If you clear your browser data or lose your phone, your progress will be lost. Create a free account to keep your study data safe across devices.
            </p>

            <div className="guest-modal-actions">
              <Button variant="primary" size="lg" fullWidth onClick={handleCreateAccount}>
                Create Free Account
              </Button>
              <Button variant="ghost" size="md" fullWidth onClick={handleDismissSession}>
                Remind me later
              </Button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && <div className="guest-toast">{toastMessage}</div>}
    </>
  );
};
