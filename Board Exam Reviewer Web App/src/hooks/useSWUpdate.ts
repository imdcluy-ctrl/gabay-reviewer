import { useState, useEffect, useCallback } from 'react';

/** Hook that detects service worker updates and provides a method to apply them. */
export function useSWUpdate() {
  const [hasUpdate, setHasUpdate] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const checkForUpdate = () => {
      navigator.serviceWorker.ready.then(reg => {
        // Check if there is already a waiting worker
        if (reg.waiting) {
          setHasUpdate(true);
          return;
        }

        // Listen for new updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setHasUpdate(true);
              }
            });
          }
        });
      });
    };

    checkForUpdate();

    // Also listen for manual update-check triggers
    const handler = () => setHasUpdate(true);
    window.addEventListener('sw-update-available', handler);
    return () => window.removeEventListener('sw-update-available', handler);
  }, []);

  const applyUpdate = useCallback(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Send SKIP_WAITING message to activate the new worker
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      // Reload to use new version
      window.location.reload();
    }
  }, []);

  return { hasUpdate, applyUpdate };
}
