import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { analytics } from '../lib/analytics';
import { EVENTS } from '../lib/events';
import './PWAInstallPrompt.css';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return localStorage.getItem('gabay_pwa_dismissed') === 'true';
  });

  const [hasCompletedSession] = useState<boolean>(() => {
    return sessionStorage.getItem('has_completed_session') === 'true';
  });

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    const handleAppInstalled = () => {
      analytics.track(EVENTS.PWA_INSTALLED);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Check display-mode standalone
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  if (isStandalone || !deferredPrompt || !hasCompletedSession || isDismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    analytics.track(EVENTS.PWA_INSTALL_PROMPTED);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      analytics.track(EVENTS.PWA_INSTALLED);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem('gabay_pwa_dismissed', 'true');
    setIsDismissed(true);
  };

  return (
    <div className="pwa-install-banner">
      <div className="pwa-banner-text">
        <span className="pwa-icon">📲</span>
        <span>Add Gabay to your home screen for quick access</span>
      </div>
      <div className="pwa-banner-actions">
        <Button variant="primary" size="sm" onClick={handleInstallClick}>
          Install
        </Button>
        <button className="pwa-dismiss-btn" onClick={handleDismiss}>
          Not now
        </button>
      </div>
    </div>
  );
};
