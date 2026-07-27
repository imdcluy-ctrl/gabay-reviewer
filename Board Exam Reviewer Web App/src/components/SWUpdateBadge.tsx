import React from 'react';
import { useSWUpdate } from '../hooks/useSWUpdate';
import './SWUpdateBadge.css';

export const SWUpdateBadge: React.FC = () => {
  const { hasUpdate, applyUpdate } = useSWUpdate();

  if (!hasUpdate) return null;

  return (
    <button className="sw-update-badge" onClick={applyUpdate} title="New version available">
      <span className="sw-update-dot" />
      <span className="sw-update-text">Update</span>
    </button>
  );
};
