import React, { useState, useEffect, useRef } from 'react';
import { canRetakeExam, generateRetakeSelection, type CooldownStatus, type RetakeOverlapResult } from '../../lib/retakeManager';
import { MockExamPersistence } from '../../lib/mockExamPersistence';
import { trapFocus } from '../../lib/focusTrap';
import { Card } from '../Card';
import { Button } from '../Button';
import './RetakeLauncher.css';

export interface RetakeLauncherProps {
  mockExamId: string;
  examTitle: string;
  userId: string;
  onClose: () => void;
  onLaunch: (attemptId: string) => void;
}

export const RetakeLauncher: React.FC<RetakeLauncherProps> = ({
  mockExamId,
  examTitle,
  userId,
  onClose,
  onLaunch,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLaunching, setIsLaunching] = useState<boolean>(false);
  const [mode, setMode] = useState<'practice' | 'simulation'>('practice');

  const [cooldown, setCooldown] = useState<CooldownStatus | null>(null);
  const [overlap, setOverlap] = useState<RetakeOverlapResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cleanupTrap: (() => void) | undefined;
    if (modalRef.current) {
      cleanupTrap = trapFocus(modalRef.current);
    }

    async function loadPreflight() {
      try {
        setIsLoading(true);
        const cd = await canRetakeExam(userId, mockExamId);
        setCooldown(cd);

        const outcome = await generateRetakeSelection(userId, mockExamId);
        if (!outcome.selection.ok) {
          setErrorMessage(outcome.selection.reason === 'pool_too_small'
            ? 'Question pool too small for this exam section.'
            : outcome.selection.message);
        } else {
          setOverlap(outcome.overlapResult);
        }
        setIsLoading(false);
      } catch (err: any) {
        setErrorMessage(err.message || 'Error initializing retake pre-flight.');
        setIsLoading(false);
      }
    }

    loadPreflight();

    return () => {
      if (cleanupTrap) cleanupTrap();
    };
  }, [userId, mockExamId]);

  const handleStartRetake = async () => {
    try {
      setIsLaunching(true);
      const outcome = await generateRetakeSelection(userId, mockExamId);
      if (!outcome.selection.ok) {
        throw new Error('Selection engine failed to generate retake items.');
      }

      const attempt = await MockExamPersistence.createAttempt(
        userId,
        mockExamId,
        mode,
        outcome.selection.questions
      );
      onLaunch(attempt.id);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create retake attempt.');
      setIsLaunching(false);
    }
  };

  return (
    <div ref={modalRef} className="retake-launcher-modal-overlay" role="dialog" aria-modal="true">
      <Card className="retake-launcher-card">
        <header className="launcher-header">
          <h3>🔄 Retake Exam Pre-Flight: {examTitle}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </header>

        {isLoading ? (
          <div className="launcher-loading">
            <div className="spinner" />
            <p>Evaluating question pool freshness &amp; overlap...</p>
          </div>
        ) : errorMessage ? (
          <div className="launcher-error">
            <p>⚠️ {errorMessage}</p>
            <Button variant="secondary" size="sm" onClick={onClose}>Close</Button>
          </div>
        ) : (
          <main className="launcher-content">
            {/* M2: Soft Cooldown Banner (3+ attempts in 7 days) */}
            {cooldown?.warning && (
              <div className="cooldown-warning-banner" role="alert">
                {cooldown.warning}
              </div>
            )}

            {/* INV-012 Overlap Meter Badge */}
            {overlap && (
              <div className={`overlap-badge-box ${overlap.isHighOverlap ? 'high' : 'good'}`}>
                <div className="overlap-stat-row">
                  <span className="overlap-pct-text">
                    {overlap.isHighOverlap ? '⚠️ High Overlap:' : '✅ Fresh Question Selection:'}{' '}
                    <strong>{overlap.overlapPercentage}% Repeated Items</strong>
                  </span>
                  <span className="overlap-counts">
                    ({overlap.unseenItems} Fresh / {overlap.seenItems} Repeated vs Last 2 Attempts)
                  </span>
                </div>
                {overlap.warningMessage && (
                  <p className="overlap-warning-text">{overlap.warningMessage}</p>
                )}
              </div>
            )}

            {/* Mode Selection Toggle */}
            <div className="mode-selection-group">
              <label className="mode-label">Select Exam Session Mode:</label>
              <div className="mode-options-grid">
                <button
                  type="button"
                  className={`mode-card-btn ${mode === 'practice' ? 'selected' : ''}`}
                  onClick={() => setMode('practice')}
                >
                  <strong>Practice Mode 📖</strong>
                  <span>Allows pauses, instant hint ladders, and per-question explanations.</span>
                </button>

                <button
                  type="button"
                  className={`mode-card-btn ${mode === 'simulation' ? 'selected' : ''}`}
                  onClick={() => setMode('simulation')}
                >
                  <strong>CSC Real Simulation ⏱</strong>
                  <span>Strict single deadline timer. No pausing, no hints, real exam rules.</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <footer className="launcher-actions">
              <Button variant="secondary" onClick={onClose} disabled={isLaunching}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleStartRetake} disabled={isLaunching}>
                {isLaunching ? 'Creating Retake Attempt...' : 'Launch Retake Attempt 🚀'}
              </Button>
            </footer>
          </main>
        )}
      </Card>
    </div>
  );
};

export default RetakeLauncher;
