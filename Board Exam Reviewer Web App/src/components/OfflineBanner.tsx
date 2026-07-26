import React from 'react';
import { useOffline } from '../hooks/useOffline';
import './OfflineBanner.css';

export const OfflineBanner: React.FC = () => {
  const { isOffline } = useOffline();

  if (!isOffline) return null;

  return (
    <div className="offline-banner" role="alert">
      <span>📴</span>
      <span>Offline — progress saved on this device</span>
    </div>
  );
};
