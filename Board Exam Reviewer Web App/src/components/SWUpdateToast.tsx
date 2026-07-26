import React, { useEffect, useState } from 'react';

export const SWUpdateToast: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Listen for service worker updates
    const handleUpdate = () => {
      setShow(true);
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                handleUpdate();
              }
            });
          }
        });
      });

      // Also detect updates via registerSW auto-update
      window.addEventListener('sw-update-available', handleUpdate);
    }

    return () => window.removeEventListener('sw-update-available', handleUpdate);
  }, []);

  const handleUpdate = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  if (!show) return null;

  return (
    <div className="sw-update-toast" onClick={handleUpdate}>
      <span>New version available! Click to update.</span>
    </div>
  );
};
