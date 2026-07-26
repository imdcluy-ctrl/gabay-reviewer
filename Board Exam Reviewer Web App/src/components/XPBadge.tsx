import React from 'react';
import { getLevelEmoji } from '../lib/xp';
import './XPBadge.css';

interface XPBadgeProps {
  level: number;
  title: string;
  progress: number; // 0-100
  totalXp: number;
  size?: 'sm' | 'md' | 'lg';
}

export const XPBadge: React.FC<XPBadgeProps> = ({
  level,
  title,
  progress,
  totalXp,
  size = 'sm',
}) => {
  return (
    <div className={`xp-badge xp-badge-${size}`}>
      <div className="xp-badge-level">
        <span className="xp-level-emoji">{getLevelEmoji(level)}</span>
        <span className="xp-level-num">Lv.{level}</span>
      </div>
      <div className="xp-badge-details">
        <span className="xp-badge-title">{title}</span>
        <div className="xp-progress-bar-bg">
          <div
            className="xp-progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="xp-total">{totalXp.toLocaleString()} XP</span>
      </div>
    </div>
  );
};
