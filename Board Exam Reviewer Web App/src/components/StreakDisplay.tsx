import React from 'react';
import { Card } from './Card';
import { useStreak } from '../hooks/useStreak';
import './StreakDisplay.css';

export const StreakDisplay: React.FC = () => {
  const { currentStreak, lastSevenDays } = useStreak();

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <Card className="streak-card">
      <div className="streak-header">
        <div className="streak-flame-wrapper">
          <span className={`flame-icon ${currentStreak > 0 ? 'active' : ''}`}>🔥</span>
          <div className="streak-text-group">
            <span className="streak-count-title">
              {currentStreak > 0 ? `${currentStreak} Day Streak!` : 'Start your streak today!'}
            </span>
            <span className="streak-subtitle">
              {currentStreak > 0
                ? 'Consistency is key to exam success'
                : 'Complete 1 question daily to build momentum'}
            </span>
          </div>
        </div>
      </div>

      <div className="streak-dots-row">
        {lastSevenDays.map((studied, idx) => (
          <div key={idx} className="streak-day-col">
            <div className={`streak-dot ${studied ? 'studied' : ''}`} />
            <span className="streak-day-label">{dayLabels[idx]}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};
