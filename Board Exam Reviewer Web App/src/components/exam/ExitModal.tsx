import React, { useEffect, useRef } from 'react';
import { Button } from '../Button';
import { trapFocus } from '../../lib/focusTrap';
import './ExitModal.css';

export interface ExitModalProps {
  isOpen: boolean;
  mode: 'practice' | 'simulation';
  onResume: () => void;
  onSavePause?: () => void;
  onAbandon: () => void;
}

export const ExitModal: React.FC<ExitModalProps> = ({
  isOpen,
  mode,
  onResume,
  onSavePause,
  onAbandon,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    const cleanupTrap = trapFocus(modalRef.current);
    return cleanupTrap;
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div ref={modalRef} className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="exit-modal-title">
      <div className="exit-modal-card">
        <h2 id="exit-modal-title" className="modal-title warning">
          ⚠️ Leave Exam Attempt?
        </h2>

        <p className="exit-modal-text">
          {mode === 'simulation'
            ? 'Real CSC Simulation mode does not support saving or pausing mid-exam. Leaving now will abandon this attempt.'
            : 'You are currently in an active exam session. You can save and pause your session to resume later, or abandon this attempt.'}
        </p>

        <div className="exit-modal-actions">
          <Button variant="secondary" size="md" onClick={onResume}>
            Resume Exam
          </Button>

          {mode === 'practice' && onSavePause && (
            <Button variant="secondary" size="md" onClick={onSavePause}>
              Save & Pause
            </Button>
          )}

          <Button variant="primary" size="md" onClick={onAbandon}>
            Abandon Attempt
          </Button>
        </div>
      </div>
    </div>
  );
};
