import React from 'react';
import type { LocalQuestion } from '../lib/db';
import { Button } from './Button';
import './ResultFeedback.css';

interface ResultFeedbackProps {
  isCorrect: boolean;
  selectedOption: string;
  correctOption: string;
  question: LocalQuestion;
  confidenceRating: number;
  onSeeExplanation: () => void;
  onNextQuestion?: () => void;
}

export const ResultFeedback: React.FC<ResultFeedbackProps> = ({
  isCorrect,
  selectedOption,
  correctOption,
  question,
  confidenceRating,
  onSeeExplanation,
  onNextQuestion,
}) => {
  const selectedObj = question.options.find(o => o.key === selectedOption);
  const correctObj = question.options.find(o => o.key === correctOption);

  return (
    <div className={`result-feedback-card ${isCorrect ? 'correct' : 'incorrect'}`}>
      <div className="rf-header">
        <div className={`rf-icon-badge ${isCorrect ? 'correct-icon' : 'incorrect-icon'}`}>
          {isCorrect ? '✓' : '✕'}
        </div>
        <h2 className="rf-title">{isCorrect ? 'Correct! ✓' : 'Not quite'}</h2>
      </div>

      {isCorrect ? (
        <div className="rf-body">
          <p className="rf-correct-msg">
            Great job! You picked <strong>{selectedOption}: {selectedObj?.text}</strong>
          </p>
          {confidenceRating === 1 && (
            <p className="rf-unsure-boost">
              And you weren't sure — trust your instincts more! 💪
            </p>
          )}
        </div>
      ) : (
        <div className="rf-body">
          <div className="rf-choice-row chosen">
            <span className="rf-label">You chose:</span>
            <span className="rf-val">{selectedOption}: {selectedObj?.text}</span>
          </div>

          <div className="rf-choice-row correct-answer">
            <span className="rf-label">Correct answer:</span>
            <span className="rf-val">{correctOption}: {correctObj?.text}</span>
          </div>
        </div>
      )}

      <div className="rf-actions">
        <Button variant="primary" size="lg" fullWidth onClick={onSeeExplanation}>
          {isCorrect ? 'See Explanation →' : 'See Why →'}
        </Button>
        {isCorrect && onNextQuestion && (
          <Button variant="ghost" size="md" fullWidth onClick={onNextQuestion}>
            Next Question →
          </Button>
        )}
      </div>
    </div>
  );
};
