import React from 'react';
import { Card } from './Card';
import './ProgressCard.css';

interface ProgressCardProps {
  name: string;
  icon: string;
  attempted: number;
  total: number;
  accuracy: number | null;
  onClick: () => void;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  name,
  icon,
  attempted,
  total,
  accuracy,
  onClick,
}) => {
  const isAvailable = total > 0;
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    accuracy !== null ? circumference - (accuracy / 100) * circumference : circumference;

  return (
    <Card variant={isAvailable ? 'interactive' : 'flat'} className="progress-card" onClick={onClick}>
      <div className="progress-card-top">
        <span className="pc-icon">{icon}</span>
        <div className="pc-ring-wrapper">
          <svg className="pc-ring-svg" width="48" height="48" viewBox="0 0 48 48">
            <circle
              className="pc-ring-bg"
              cx="24"
              cy="24"
              r={radius}
              strokeWidth="4"
            />
            {accuracy !== null && (
              <circle
                className="pc-ring-fill"
                cx="24"
                cy="24"
                r={radius}
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            )}
          </svg>
          <span className="pc-ring-text">
            {accuracy !== null ? `${accuracy}%` : '--'}
          </span>
        </div>
      </div>

      <div className="progress-card-bottom">
        <h4 className="pc-name">{name}</h4>
        <span className="pc-sub">
          {isAvailable ? `${attempted}/${total} attempted` : 'Coming soon'}
        </span>
      </div>
    </Card>
  );
};
