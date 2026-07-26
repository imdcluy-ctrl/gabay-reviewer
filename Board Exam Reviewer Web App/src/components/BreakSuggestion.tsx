import React from 'react';
import { Button } from './Button';
import './BreakSuggestion.css';

interface BreakSuggestionProps {
  questionsAnswered: number;
  minutesElapsed: number;
  onTakeBreak: () => void;
  onKeepGoing: () => void;
}

export const BreakSuggestion: React.FC<BreakSuggestionProps> = ({
  questionsAnswered,
  minutesElapsed,
  onTakeBreak,
  onKeepGoing,
}) => {
  return (
    <div className="break-overlay">
      <div className="break-card">
        <span className="break-brain-emoji">🧠</span>
        <h2 className="break-title">Nice work!</h2>
        <p className="break-stats">
          You've been studying for <strong>{minutesElapsed} minutes</strong> and answered{' '}
          <strong>{questionsAnswered} questions</strong>.
        </p>
        <p className="break-advice">
          Taking a 5-minute break helps your brain consolidate what you've learned into long-term memory.
        </p>

        <div className="break-actions">
          <Button variant="primary" size="lg" fullWidth onClick={onTakeBreak}>
            Take a Break
          </Button>
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={() => {
              onTakeBreak();
              window.location.href = '/anxiety';
            }}
          >
            🫁 Open Box Breathing Toolkit
          </Button>
          <Button variant="secondary" size="md" fullWidth onClick={onKeepGoing}>
            Keep Going
          </Button>
        </div>
      </div>
    </div>
  );
};
