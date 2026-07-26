import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { analytics } from '../lib/analytics';
import { EVENTS } from '../lib/events';
import './MergePrompt.css';

interface MergePromptProps {
  attemptsCount: number;
  isGuest: boolean;
}

export const MergePrompt: React.FC<MergePromptProps> = ({ attemptsCount, isGuest }) => {
  const navigate = useNavigate();

  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    const dismissedAt = localStorage.getItem('merge_prompt_dismissed_at_count');
    if (!dismissedAt) return false;
    const dismissedCount = parseInt(dismissedAt, 10);
    // Remind again after 10 more questions
    return attemptsCount - dismissedCount < 10;
  });

  if (!isGuest || attemptsCount < 5 || isDismissed) {
    return null;
  }

  const handleCreateAccount = () => {
    analytics.track(EVENTS.SIGNUP_PROMPTED, { source: 'merge_prompt', attempts_count: attemptsCount });
    navigate('/auth');
  };

  const handleDismiss = () => {
    localStorage.setItem('merge_prompt_dismissed_at_count', attemptsCount.toString());
    setIsDismissed(true);
  };

  return (
    <div className="merge-backdrop">
      <div className="merge-sheet">
        <span className="merge-sheet-icon">📱</span>
        <h3 className="merge-sheet-title">Your progress is saved on this device only</h3>
        <p className="merge-sheet-body">
          You've answered {attemptsCount} questions! Create a free account to back up your study data and sync your progress.
        </p>

        <div className="merge-sheet-actions">
          <Button variant="primary" size="lg" fullWidth onClick={handleCreateAccount}>
            Create Free Account
          </Button>
          <button className="merge-not-now-btn" onClick={handleDismiss}>
            Not now
          </button>
        </div>
      </div>
    </div>
  );
};
