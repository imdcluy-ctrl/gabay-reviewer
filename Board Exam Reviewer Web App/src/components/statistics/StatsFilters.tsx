import React from 'react';
import type { StatsWindow } from '../../lib/deepAnalytics/types';
import './StatsFilters.css';

interface StatsFiltersProps {
  currentWindow: StatsWindow;
  onWindowChange: (window: StatsWindow) => void;
}

export const StatsFilters: React.FC<StatsFiltersProps> = ({ currentWindow, onWindowChange }) => {
  return (
    <div className="stats-filters-bar">
      <span className="filters-label">Analytics Window:</span>
      <div className="filter-buttons-group">
        <button
          type="button"
          className={`filter-btn ${currentWindow === 'last_30_mocks' ? 'active' : ''}`}
          onClick={() => onWindowChange('last_30_mocks')}
        >
          Last 30 Completed Mocks
        </button>
        <button
          type="button"
          className={`filter-btn ${currentWindow === 'last_90_days' ? 'active' : ''}`}
          onClick={() => onWindowChange('last_90_days')}
        >
          Last 90 Days
        </button>
        <button
          type="button"
          className={`filter-btn ${currentWindow === 'all_time' ? 'active' : ''}`}
          onClick={() => onWindowChange('all_time')}
        >
          All Time
        </button>
      </div>
    </div>
  );
};
