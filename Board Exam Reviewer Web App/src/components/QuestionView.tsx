import React, { useState } from 'react';
import type { LocalQuestion } from '../lib/db';
import { Button } from './Button';
import { ScratchpadModal } from './ScratchpadModal';
import { FormulaReferenceDrawer } from './FormulaReferenceDrawer';
import './QuestionView.css';

interface QuestionViewProps {
  question: LocalQuestion;
  selectedOption: string | null;
  onSelectOption: (optionKey: string) => void;
  onSubmit: () => void;
  onRequestHint: () => void;
  elapsedSeconds: number;
  children?: React.ReactNode;
}

export const QuestionView: React.FC<QuestionViewProps> = ({
  question,
  selectedOption,
  onSelectOption,
  onSubmit,
  onRequestHint,
  elapsedSeconds,
  children,
}) => {
  const [showScratchpad, setShowScratchpad] = useState<boolean>(false);
  const [showFormulas, setShowFormulas] = useState<boolean>(false);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="question-view-container">
      {/* Top Header Row */}
      <div className="qv-header">
        <span className="qv-badge">{(question.subtopic_id || question.subtopic || '').replace('-', ' ')}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button 
            className="qv-tool-btn" 
            title="Open Scratchpad"
            onClick={() => setShowScratchpad(true)}
            style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-bg-card)', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            📝 Scratchpad
          </button>
          <button 
            className="qv-tool-btn" 
            title="Open Formulas"
            onClick={() => setShowFormulas(true)}
            style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-bg-card)', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            📐 Formulas
          </button>
          <span className="qv-timer">⏱ {formatTime(elapsedSeconds)}</span>
        </div>
      </div>

      {/* Question Text */}
      <div className="qv-text-box">
        <p className="qv-question-text">{question.question_text}</p>
      </div>

      {/* Options List */}
      <div className="qv-options-list">
        {(() => {
          const rawOptions = (question.options as any) || [];
          const normalizedOptions: { key: string; text: string }[] = Array.isArray(rawOptions)
            ? rawOptions.map((opt: any, idx: number) => {
                if (typeof opt === 'string') {
                  const defaultKey = String.fromCharCode(65 + idx);
                  return { key: defaultKey, text: opt };
                }
                if (opt && typeof opt === 'object') {
                  const key = opt.key || opt.id || String.fromCharCode(65 + idx);
                  const text = opt.text || opt.label || opt.value || '';
                  return { key, text };
                }
                return { key: String.fromCharCode(65 + idx), text: String(opt) };
              })
            : Object.entries(rawOptions).map(([k, v]) => ({
                key: k,
                text: typeof v === 'string' ? v : (v as any)?.text || String(v)
              }));

          return normalizedOptions.map(opt => {
            const isSelected = selectedOption === opt.key;
            return (
              <button
                key={opt.key}
                className={`qv-option-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectOption(opt.key)}
              >
                <span className="qv-option-key">{opt.key}</span>
                <span className="qv-option-text">{opt.text}</span>
              </button>
            );
          });
        })()}
      </div>

      {/* Inline Slot for HintLadder & Scaffolding */}
      {children}

      {/* Modals & Drawers */}
      {showScratchpad && <ScratchpadModal onClose={() => setShowScratchpad(false)} />}
      <FormulaReferenceDrawer isOpen={showFormulas} onClose={() => setShowFormulas(false)} />

      {/* Sticky Bottom Actions */}
      <div className="qv-actions-sticky">
        <Button variant="secondary" size="md" onClick={onRequestHint}>
          👋 Guide Me
        </Button>
        <Button
          variant="primary"
          size="md"
          disabled={!selectedOption}
          onClick={onSubmit}
        >
          Submit Answer →
        </Button>
      </div>
    </div>
  );
};
