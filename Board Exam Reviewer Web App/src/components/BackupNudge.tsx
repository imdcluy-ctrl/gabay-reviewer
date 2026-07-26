import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import { Button } from './Button';
import { analytics } from '../lib/analytics';
import { EVENTS } from '../lib/events';
import './BackupNudge.css';

// Session-level in-memory flag (§7 guardrail #2: <= 1 per session)
let hasShownNudgeThisSession = false;

interface BackupNudgeProps {
  hintsUsedCount: number;
  isCorrect: boolean;
}

export const BackupNudge: React.FC<BackupNudgeProps> = ({ hintsUsedCount, isCorrect }) => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();

  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    // Guardrail #1: Guests only
    const isGuest = profile && !profile.auth_user_id;
    if (!isGuest) return;

    // Guardrail #2: Session-level in-memory flag
    if (hasShownNudgeThisSession) return;

    // Guardrail #3: 14-day snooze check
    const snoozeUntil = localStorage.getItem('backup_nudge_snoozed_until');
    if (snoozeUntil) {
      const snoozeDate = new Date(snoozeUntil);
      if (!isNaN(snoozeDate.getTime()) && Date.now() < snoozeDate.getTime()) {
        return;
      }
    }

    // Trigger condition: Guest answers Correct after using >= 1 hint
    if (isCorrect && hintsUsedCount >= 1) {
      hasShownNudgeThisSession = true;
      setIsVisible(true);
      analytics.track(EVENTS.BACKUP_NUDGE_SHOWN, { trigger: 'hint_assisted_correct' });
    }
  }, [hintsUsedCount, isCorrect, profile]);

  if (!isVisible) return null;

  const apply14DaySnooze = () => {
    const snoozeUntil = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    localStorage.setItem('backup_nudge_snoozed_until', snoozeUntil);
  };

  const handleConvert = () => {
    apply14DaySnooze();
    analytics.track(EVENTS.BACKUP_NUDGE_CONVERTED);
    setIsVisible(false);
    navigate('/auth');
  };

  const handleDismiss = () => {
    apply14DaySnooze();
    analytics.track(EVENTS.BACKUP_NUDGE_DISMISSED);
    setIsVisible(false);
  };

  return (
    <div className="backup-nudge-toast">
      <div className="nudge-text-group">
        <span className="nudge-icon">🎉</span>
        <div className="nudge-message">
          <strong>Coaching Insight:</strong> You decoded a tricky trap using the hint ladder! Create a free account to back up your progress across devices.
        </div>
      </div>
      <div className="nudge-actions">
        <Button variant="primary" size="sm" onClick={handleConvert}>
          Back Up Progress
        </Button>
        <button className="nudge-dismiss-btn" onClick={handleDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
};
