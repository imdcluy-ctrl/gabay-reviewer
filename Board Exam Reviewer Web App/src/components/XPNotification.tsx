import React, { useEffect, useState } from 'react';
import './XPNotification.css';

interface XPNotificationProps {
  amount: number;
  source?: string;
  onComplete?: () => void;
}

export const XPNotification: React.FC<XPNotificationProps> = ({ amount, source, onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 1400);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  const sourceEmoji: Record<string, string> = {
    correct: '✅',
    wrong: '❌',
    streak_bonus: '🔥',
    first_daily: '🌅',
    session_complete: '✅',
    no_hints_bonus: '🧠',
    mock_complete: '📝',
    achievement: '🏅',
  };

  return (
    <div className="xp-notification">
      <span className="xp-notif-emoji">{sourceEmoji[source || 'correct'] || '?'}</span>
      <span className="xp-notif-amount">+{amount} XP</span>
      {source === 'streak_bonus' && <span className="xp-notif-badge">🔥 STREAK</span>}
    </div>
  );
};
