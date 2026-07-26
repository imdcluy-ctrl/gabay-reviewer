import React from 'react';
import { Button } from '../Button';
import { PacingGauge } from './PacingGauge';
import './ExamHeader.css';

export interface ExamHeaderProps {
  title: string;
  sectionName: string;
  currentIndex: number;
  totalQuestions: number;
  remainingSeconds: number;
  mode: 'practice' | 'simulation';
  isPaused: boolean;
  isFlagged: boolean;
  onTogglePalette: () => void;
  onToggleFlag: () => void;
  onPauseResume?: () => void;
}

export const ExamHeader: React.FC<ExamHeaderProps> = React.memo(({
  title,
  sectionName,
  currentIndex,
  totalQuestions,
  remainingSeconds,
  mode,
  isPaused,
  isFlagged,
  onTogglePalette,
  onToggleFlag,
  onPauseResume,
}) => {
  const formatTimer = (totalSecs: number): string => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  // Timer visual color classes (White -> Orange <=15m -> Red <=5m -> Pulsing Red <=60s)
  let timerColorClass = 'timer-normal';
  if (remainingSeconds <= 60) {
    timerColorClass = 'timer-critical-pulse';
  } else if (remainingSeconds <= 300) {
    timerColorClass = 'timer-warning-red';
  } else if (remainingSeconds <= 900) {
    timerColorClass = 'timer-warning-orange';
  }

  // Screen reader aria-live announcements (M5)
  let announcement = '';
  if (remainingSeconds === 900) announcement = '15 minutes remaining in your exam.';
  if (remainingSeconds === 300) announcement = '5 minutes remaining in your exam.';
  if (remainingSeconds === 60) announcement = '1 minute remaining in your exam.';

  const progressPct = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  // Total time in seconds for exam (e.g. 190 mins = 11400s)
  const totalExamSeconds = totalQuestions > 150 ? 11400 : 9600;
  const elapsedExamSeconds = Math.max(0, totalExamSeconds - remainingSeconds);

  return (
    <header className="exam-header-sticky">
      <div className="exam-header-top">
        <div className="exam-title-group">
          <h1 className="exam-title">{title}</h1>
          <span className="exam-section-badge">{sectionName}</span>
          <span className={`exam-mode-badge ${mode}`}>{mode === 'practice' ? 'Practice' : 'Simulation'}</span>
          <PacingGauge
            currentIndex={currentIndex}
            totalQuestions={totalQuestions}
            elapsedSeconds={elapsedExamSeconds}
          />
        </div>

        <div className="exam-timer-group">
          {/* M5 Screen Reader Announcement */}
          <div className="sr-only" aria-live="polite">
            {announcement}
          </div>

          <div className={`exam-timer-display ${timerColorClass}`}>
            ⏱ {formatTimer(remainingSeconds)}
          </div>

          <div className="exam-header-controls">
            {/* L2 Pause/Resume Button (Hidden in Simulation mode) */}
            {mode === 'practice' && onPauseResume && (
              <Button variant="secondary" size="sm" onClick={onPauseResume}>
                {isPaused ? 'Resume ▶' : 'Pause ⏸'}
              </Button>
            )}

            <Button
              variant={isFlagged ? 'primary' : 'secondary'}
              size="sm"
              onClick={onToggleFlag}
              aria-label="Flag current question"
            >
              {isFlagged ? '🚩 Flagged' : '🏳️ Flag'}
            </Button>

            {/* L2 Palette Toggle Button */}
            <Button variant="secondary" size="sm" onClick={onTogglePalette} aria-label="Toggle Question Palette">
              📋 Palette
            </Button>
          </div>
        </div>
      </div>

      <div className="exam-progress-bar-container">
        <div className="exam-progress-bar-fill" style={{ width: `${progressPct}%` }} />
      </div>
    </header>
  );
});
