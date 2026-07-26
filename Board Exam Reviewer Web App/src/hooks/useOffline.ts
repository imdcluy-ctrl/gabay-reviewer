import { useState, useEffect } from 'react';

export function useOffline(): { isOffline: boolean } {
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  useEffect(() => {
    let timeoutId: number | null = null;

    const handleOnline = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setIsOffline(false);
      }, 500);
    };

    const handleOffline = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setIsOffline(true);
      }, 500);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOffline };
}
