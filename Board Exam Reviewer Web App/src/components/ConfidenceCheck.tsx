import React from 'react';
import './ConfidenceCheck.css';

interface ConfidenceCheckProps {
  onSelectConfidence: (rating: number) => void;
}

export const ConfidenceCheck: React.FC<ConfidenceCheckProps> = ({ onSelectConfidence }) => {
  return (
    <div className="confidence-backdrop">
      <div className="confidence-sheet">
        <h3 className="confidence-title">How sure were you?</h3>
        <p className="confidence-subtext">Calibrating your metacognitive judgment</p>

        <div className="confidence-buttons-row">
          <button
            className="confidence-btn btn-unsure"
            onClick={() => onSelectConfidence(1)}
          >
            <span className="conf-emoji">😟</span>
            <span className="conf-label">Not sure</span>
          </button>

          <button
            className="confidence-btn btn-maybe"
            onClick={() => onSelectConfidence(2)}
          >
            <span className="conf-emoji">🤔</span>
            <span className="conf-label">Maybe</span>
          </button>

          <button
            className="confidence-btn btn-sure"
            onClick={() => onSelectConfidence(3)}
          >
            <span className="conf-emoji">😎</span>
            <span className="conf-label">Sure</span>
          </button>
        </div>
      </div>
    </div>
  );
};
