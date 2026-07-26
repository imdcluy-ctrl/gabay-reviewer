import React, { useEffect, useRef } from 'react';
import { Button } from '../Button';
import { trapFocus } from '../../lib/focusTrap';
import './SubmitConfirmationModal.css';

export interface SubmitConfirmationModalProps {
  isOpen: boolean;
  unansweredCount: number;
  flaggedCount: number;
  timeRemainingSeconds: number;
  mode: 'practice' | 'simulation';
  onConfirmSubmit: () => void;
  onCancel: () => void;
}

export const SubmitConfirmationModal: React.FC<SubmitConfirmationModalProps> = ({
  isOpen,
  unansweredCount,
  flaggedCount,
  timeRemainingSeconds,
  mode,
  onConfirmSubmit,
  onCancel,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    let cleanupTrap: (() => void) | undefined;
    if (modalRef.current) {
      cleanupTrap = trapFocus(modalRef.current);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onConfirmSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (cleanupTrap) cleanupTrap();
    };
  }, [isOpen, onCancel, onConfirmSubmit]);

  if (!isOpen) return null;

  const formatTimer = (totalSecs: number): string => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  return (
    <div ref={modalRef} className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="submit-modal-title">
      <div className="submit-modal-card">
        <h2 id="submit-modal-title" className="modal-title">
          Ready to Submit Your Exam?
        </h2>

        <div className="submit-stats-grid">
          <div className={`stat-box ${unansweredCount > 0 ? 'warning' : 'ok'}`}>
            <span className="stat-value">{unansweredCount}</span>
            <span className="stat-label">Unanswered</span>
          </div>

          <div className="stat-box flagged">
            <span className="stat-value">{flaggedCount}</span>
            <span className="stat-label">Flagged Items</span>
          </div>

          <div className="stat-box time">
            <span className="stat-value">{formatTimer(timeRemainingSeconds)}</span>
            <span className="stat-label">Time Remaining</span>
          </div>
        </div>

        {unansweredCount > 0 && (
          <p className="unanswered-warning-text">
            ⚠️ You still have <strong>{unansweredCount} unanswered questions</strong>. Any unanswered questions will be marked incorrect upon submission.
          </p>
        )}

        <div className="mode-reminder-badge">
          Mode: <strong>{mode === 'practice' ? 'Practice Mock' : 'Real CSC Simulation'}</strong>
        </div>

        <div className="modal-actions">
          <Button variant="secondary" size="md" onClick={onCancel}>
            Continue Exam (Esc)
          </Button>
          <Button variant="primary" size="md" onClick={onConfirmSubmit}>
            Submit Exam (Enter) ➔
          </Button>
        </div>
      </div>
    </div>
  );
};
