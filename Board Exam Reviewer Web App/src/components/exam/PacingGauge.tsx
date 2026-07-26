import React from 'react';
import './PacingGauge.css';

interface PacingGaugeProps {
  currentIndex: number;
  totalQuestions: number;
  elapsedSeconds: number;
  targetSecondsPerItem?: number; // Default ~67s for Professional
}

export const PacingGauge: React.FC<PacingGaugeProps> = ({
  currentIndex,
  elapsedSeconds,
  targetSecondsPerItem = 67,
}) => {
  if (currentIndex === 0) return null;

  const expectedElapsed = currentIndex * targetSecondsPerItem;
  const deltaSeconds = expectedElapsed - elapsedSeconds;

  let message = 'On Track';
  let badgeColor = '#10B981';

  if (deltaSeconds < -120) {
    const minsBehind = Math.abs(Math.round(deltaSeconds / 60));
    message = `${minsBehind}m Behind Pace`;
    badgeColor = '#EF4444';
  } else if (deltaSeconds > 120) {
    const minsAhead = Math.round(deltaSeconds / 60);
    message = `${minsAhead}m Ahead of Pace`;
    badgeColor = '#3B82F6';
  }

  return (
    <div className="pacing-gauge-badge" style={{ backgroundColor: `${badgeColor}15`, borderColor: badgeColor, color: badgeColor }}>
      <span className="gauge-icon">⏱️</span>
      <span className="gauge-text">{message}</span>
    </div>
  );
};
