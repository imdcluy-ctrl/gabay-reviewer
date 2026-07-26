import React, { useState } from 'react';
import type { LocalQuestion } from '../lib/db';
import { Badge } from './Badge';
import { Button } from './Button';
import { AdUnit } from './AdUnit';
import './DeconstructionCard.css';

interface DeconstructionCardProps {
  question: LocalQuestion;
  children?: React.ReactNode; // For inline JournalInput placement at bottom
}

export const DeconstructionCard: React.FC<DeconstructionCardProps> = ({
  question,
  children,
}) => {
  // Step 1: Step-by-Step Solution, Step 2: Choice Analysis, Step 3: Next-Time Rule & Reflection, 4: Show All
  const [activeStep, setActiveStep] = useState<number>(1);

  return (
    <div className="deconstruction-card-container">
      {/* Step Navigation Tabs */}
      <div className="deconstruct-tabs-bar">
        <button
          className={`deconstruct-tab ${activeStep === 1 ? 'active' : ''}`}
          onClick={() => setActiveStep(1)}
        >
          <span>1. Solution</span>
        </button>
        <button
          className={`deconstruct-tab ${activeStep === 2 ? 'active' : ''}`}
          onClick={() => setActiveStep(2)}
        >
          <span>2. Choice Analysis</span>
        </button>
        <button
          className={`deconstruct-tab ${activeStep === 3 ? 'active' : ''}`}
          onClick={() => setActiveStep(3)}
        >
          <span>3. Next-Time Rule</span>
        </button>
        <button
          className={`deconstruct-tab view-all-tab ${activeStep === 4 ? 'active' : ''}`}
          onClick={() => setActiveStep(4)}
        >
          <span>Show All</span>
        </button>
      </div>

      {/* Blueprint ID Badge (Always Visible) */}
      <div className="deconstruct-section blueprint-strip">
        <div className="section-title">
          <span>🎯</span>
          <span>Blueprint ID</span>
        </div>
        <div className="blueprint-badge-wrapper">
          <Badge variant="teal">{question.blueprint_id}</Badge>
        </div>
      </div>

      {/* Question Reference Box (Right under Blueprint ID) */}
      <div className="question-reference-card">
        <div className="q-ref-header">
          <span className="q-ref-icon">📌</span>
          <span className="q-ref-title">Question Reference</span>
        </div>
        {question.passage && <p className="q-ref-passage">{question.passage}</p>}
        <p className="q-ref-prompt">{question.question_text}</p>
      </div>

      {/* STEP 1: Step-by-Step Solution */}
      {(activeStep === 1 || activeStep === 4) && (
        <div className="deconstruct-section step-focus-card">
          <div className="section-title">
            <span>🔍</span>
            <span>Step-by-Step Solution (Step 1 of 3)</span>
          </div>
          <div className="solution-box">
            <pre className="solution-text">{question.deconstruct_text}</pre>
          </div>
          {activeStep === 1 && (
            <div className="step-next-action">
              <Button variant="primary" size="md" onClick={() => setActiveStep(2)}>
                Next: Choice-by-Choice Analysis (Step 2/3) →
              </Button>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Choice-by-Choice Analysis */}
      {(activeStep === 2 || activeStep === 4) && (
        <div className="deconstruct-section step-focus-card">
          <div className="section-title">
            <span>🔀</span>
            <span>Choice-by-Choice Analysis (Step 2 of 3)</span>
          </div>
          <div className="choices-analysis-list">
            {question.options.map(opt => {
              const explanation = question.choice_explanations[opt.key];
              const isCorrect = opt.key === question.correct_option;

              return (
                <div
                  key={opt.key}
                  className={`choice-analysis-item ${isCorrect ? 'correct' : 'wrong'}`}
                >
                  <div className="choice-item-header">
                    <span className="choice-item-key">{opt.key}</span>
                    <span className="choice-item-text">{opt.text}</span>
                    {isCorrect ? (
                      <Badge variant="correct">✓ Correct</Badge>
                    ) : explanation?.trap_type ? (
                      <Badge variant="incorrect">TRAP: {explanation.trap_type}</Badge>
                    ) : null}
                  </div>
                  {explanation && (
                    <p className="choice-item-exp">{explanation.text}</p>
                  )}
                </div>
              );
            })}
          </div>
          {activeStep === 2 && (
            <div className="step-next-action">
              <Button variant="primary" size="md" onClick={() => setActiveStep(3)}>
                Next: Next-Time Rule (Step 3/3) →
              </Button>
            </div>
          )}
        </div>
      )}

      {/* STEP 3: Next-Time Rule & Reflection */}
      {(activeStep === 3 || activeStep === 4) && (
        <div className="deconstruct-section step-focus-card">
          <div className="next-time-rule-card">
            <div className="ntr-header">
              <span className="ntr-icon">👋</span>
              <h4>Next-Time Rule (Step 3 of 3)</h4>
            </div>
            <p className="ntr-text">{question.next_time_rule}</p>
          </div>

          {/* Inline Journal Component Slot */}
          {children}

          {activeStep === 3 && (
            <div className="step-next-action">
              <Button variant="secondary" size="sm" onClick={() => setActiveStep(4)}>
                👁️ View All Sections Together
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Subtle Post-Question Solution Footer Ad Slot */}
      <AdUnit slotId="5287093022" format="auto" className="gabay-ad-footer-safe" minHeight="60px" />
    </div>
  );
};
