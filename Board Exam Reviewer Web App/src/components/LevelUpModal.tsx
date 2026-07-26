import React from 'react';
import { Button } from './Button';
import { getLevelEmoji } from '../lib/xp';
import './LevelUpModal.css';

interface LevelUpModalProps {
  level: number;
  title: string;
  onDismiss: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ level, title, onDismiss }) => {
  return (
    <div className="levelup-overlay" onClick={onDismiss}>
      <div className="levelup-modal" onClick={e => e.stopPropagation()}>
        <div className="levelup-emoji">{getLevelEmoji(level)}</div>
        <h2 className="levelup-title">Level Up!</h2>
        <div className="levelup-badge">
          <span className="levelup-lvl">Level {level}</span>
          <span className="levelup-name">{title}</span>
        </div>
        <p className="levelup-desc">
          You've reached a new milestone! Keep studying to unlock more rewards.
        </p>
        <Button variant="primary" size="lg" fullWidth onClick={onDismiss}>
          Continue Studying ?
        </Button>
      </div>
    </div>
  );
};
