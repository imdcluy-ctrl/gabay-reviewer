import React from 'react';
import { Button } from './Button';
import './StreakCelebration.css';

interface StreakCelebrationProps {
  streak: number;
  onDismiss: () => void;
}

const STREAK_MILESTONES = [3, 7, 14, 21, 30, 60, 100];

export const StreakCelebration: React.FC<StreakCelebrationProps> = ({ streak, onDismiss }) => {
  // Find the nearest milestone
  const milestone = STREAK_MILESTONES.filter(m => m <= streak).pop() || streak;

  const messages: Record<number, { title: string; emoji: string; desc: string }> = {
    3: { title: 'Getting Started!', emoji: '??', desc: '3-day streak! You\'re building a powerful habit.' },
    7: { title: 'One Week Strong!', emoji: '????', desc: '7 days! Consistency is the key to passing the exam.' },
    14: { title: 'Two Week Warrior!', emoji: '?', desc: '14-day streak! You\'re in the top tier of examinees.' },
    21: { title: '21-Day Champion!', emoji: '??', desc: '21 days! They say it takes 21 days to form a habit — you\'ve done it!' },
    30: { title: 'Monthly Master!', emoji: '??', desc: '30-day streak! You\'re unstoppable. Keep going!' },
    60: { title: 'Two Months of Dedication!', emoji: '??', desc: '60 days of non-stop learning! Truly inspiring!' },
    100: { title: 'Century of Learning!', emoji: '??', desc: '100-day streak! You are a Gabay Legend!' },
  };

  const msg = messages[milestone] || {
    title: streak + ' Day Streak!',
    emoji: '??',
    desc: 'Keep it going! Every day counts toward your goal.'
  };

  return (
    <div className="streak-celebration-overlay" onClick={onDismiss}>
      <div className="streak-celebration-modal" onClick={e => e.stopPropagation()}>
        <div className="streak-fire">{msg.emoji}</div>
        <h2 className="streak-celebration-title">{msg.title}</h2>
        <div className="streak-count-badge">{streak} Day Streak</div>
        <p className="streak-celebration-desc">{msg.desc}</p>
        <Button variant="primary" size="lg" fullWidth onClick={onDismiss}>
          Keep Studying ?
        </Button>
      </div>
    </div>
  );
};
