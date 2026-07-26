import React, { useEffect, useRef } from 'react';
import { Button } from '../Button';
import { trapFocus } from '../../lib/focusTrap';
import './PauseOverlay.css';

export interface PauseOverlayProps {
  isPaused: boolean;
  questionStemText?: string | undefined;
  onResume: () => void;
  onExit: () => void;
}

export const PauseOverlay: React.FC<PauseOverlayProps> = ({
  isPaused,
  questionStemText,
  onResume,
  onExit,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPaused || !modalRef.current) return;
    const cleanupTrap = trapFocus(modalRef.current);
    return cleanupTrap;
  }, [isPaused]);

  if (!isPaused) return null;

  return (
    <div ref={modalRef} className="pause-overlay-backdrop" role="dialog" aria-modal="true" aria-labelledby="pause-modal-title">
      <div className="pause-modal-card">
        <div className="pause-header">
          <span className="pause-icon">⏸️</span>
          <h2 id="pause-modal-title" className="pause-title">
            EXAM PAUSED
          </h2>
        </div>

        <p className="pause-subtitle">
          Your timer is currently paused. Answer choices are hidden while paused.
        </p>

        {questionStemText && (
          <div className="pause-stem-preview">
            <span className="preview-label">CURRENT QUESTION STEM:</span>
            <p className="stem-text">{questionStemText}</p>
          </div>
        )}

        <div className="pause-actions">
          <Button variant="secondary" size="md" onClick={onExit}>
            Exit Exam (Abandon)
          </Button>
          <Button variant="primary" size="md" onClick={onResume}>
            Resume Exam ▶
          </Button>
        </div>
      </div>
    </div>
  );
};
