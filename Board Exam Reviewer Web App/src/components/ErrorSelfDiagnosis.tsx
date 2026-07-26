import React, { useState } from 'react';
import { db } from '../lib/db';
import type { ErrorTagId } from '../lib/errorTags';
import './ErrorSelfDiagnosis.css';

interface ErrorSelfDiagnosisProps {
  questionId: string;
  userId: string;
  onDiagnosed: () => void;
}

export const ErrorSelfDiagnosis: React.FC<ErrorSelfDiagnosisProps> = ({
  questionId,
  userId,
  onDiagnosed,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ErrorTagId | null>(null);

  const handleSelect = async (tag: ErrorTagId) => {
    setSelectedCategory(tag);
    try {
      const now = Date.now();
      await db.error_tags.add({
        local_user_id: userId,
        attempt_id: `practice_${questionId}_${now}`,
        question_id: questionId,
        tag,
        source: 'practice',
        created_at: now,
        updated_at: now,
      });
    } catch (err) {
      console.error('Error logging error tag:', err);
    }
    onDiagnosed();
  };

  return (
    <div className="error-self-diag-card">
      <div className="diag-header">
        <span className="diag-icon">🎯</span>
        <div>
          <h4>Self-Diagnosis Check: Why did you miss this item?</h4>
          <p className="diag-subtitle">Identify your error pattern to strengthen long-term memory calibration.</p>
        </div>
      </div>

      <div className="diag-options-grid">
        <button
          className={`diag-opt-btn ${selectedCategory === 'misread' ? 'selected' : ''}`}
          onClick={() => handleSelect('misread')}
        >
          <span className="opt-emoji">😅</span>
          <div className="opt-info">
            <strong>Careless / Misread</strong>
            <span>Knew the rule, but misread prompt or options.</span>
          </div>
        </button>

        <button
          className={`diag-opt-btn ${selectedCategory === 'conceptual' ? 'selected' : ''}`}
          onClick={() => handleSelect('conceptual')}
        >
          <span className="opt-emoji">🧩</span>
          <div className="opt-info">
            <strong>Conceptual Gap</strong>
            <span>Didn't know or remember the underlying formula/rule.</span>
          </div>
        </button>

        <button
          className={`diag-opt-btn ${selectedCategory === 'rushed' ? 'selected' : ''}`}
          onClick={() => handleSelect('rushed')}
        >
          <span className="opt-emoji">⏱️</span>
          <div className="opt-info">
            <strong>Time Pressure Rush</strong>
            <span>Rushed through the question to save time.</span>
          </div>
        </button>

        <button
          className={`diag-opt-btn ${selectedCategory === 'guess' ? 'selected' : ''}`}
          onClick={() => handleSelect('guess')}
        >
          <span className="opt-emoji">🎲</span>
          <div className="opt-info">
            <strong>Unsure / Guess</strong>
            <span>Eliminated options but took a educated guess.</span>
          </div>
        </button>
      </div>

      <div style={{ textAlign: 'right', marginTop: '0.75rem' }}>
        <button className="diag-skip-link" onClick={onDiagnosed}>
          Skip self-diagnosis &amp; show explanation →
        </button>
      </div>
    </div>
  );
};
