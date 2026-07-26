import React, { useEffect, useState } from 'react';
import type { Achievement } from '../lib/achievements';
import './AchievementToast.css';

interface Props {
  achievement: Achievement;
  onDismiss: () => void;
}

export const AchievementToast: React.FC<Props> = ({ achievement, onDismiss }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className={`achievement-toast ${visible ? 'show' : 'hide'}`}>
      <div className="achievement-toast-glow" />
      <span className="achievement-toast-emoji">{achievement.emoji}</span>
      <div className="achievement-toast-info">
        <span className="achievement-toast-label">Achievement Unlocked!</span>
        <span className="achievement-toast-title">{achievement.title}</span>
      </div>
    </div>
  );
};
