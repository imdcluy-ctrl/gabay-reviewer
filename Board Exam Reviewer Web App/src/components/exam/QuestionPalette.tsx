import React, { useMemo } from 'react';
import type { MockExamAnswer } from '../../types/mockExam';
import './QuestionPalette.css';

export interface QuestionPaletteProps {
  totalQuestions: number;
  currentIndex: number;
  answersMap: Map<number, MockExamAnswer>;
  onSelectIndex: (index: number) => void;
  onToggleFlag?: (index: number) => void; // L3: 'F' key to flag
  mode?: 'live' | 'review'; // M4: live exam vs post-exam review
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = React.memo(({
  totalQuestions,
  currentIndex,
  answersMap,
  onSelectIndex,
  onToggleFlag,
  mode = 'live',
}) => {
  // M1 / INV-025: Derive palette button states via useMemo over answer map keys
  const paletteItems = useMemo(() => {
    const items = [];
    for (let i = 0; i < totalQuestions; i++) {
      const ans = answersMap.get(i);
      const isAnswered = ans && ans.chosen_option !== null;
      const isFlagged = ans ? ans.flagged : false;
      const isCorrect = ans ? ans.is_correct : null;

      items.push({
        index: i,
        number: i + 1,
        isAnswered,
        isFlagged,
        isCorrect,
      });
    }
    return items;
  }, [totalQuestions, answersMap]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight' && index < totalQuestions - 1) {
      onSelectIndex(index + 1);
    } else if (e.key === 'ArrowLeft' && index > 0) {
      onSelectIndex(index - 1);
    } else if (e.key === 'Enter') {
      onSelectIndex(index);
    } else if (e.key.toLowerCase() === 'f' && onToggleFlag) { // L3: F key shortcut
      e.preventDefault();
      onToggleFlag(index);
    }
  };

  return (
    <div className="question-palette-container">
      <div className="palette-legend">
        <span className="legend-item legend-answered">
          <span className="legend-icon">●</span> Answered
        </span>
        <span className="legend-item legend-unanswered">
          <span className="legend-icon">○</span> Unanswered
        </span>
        <span className="legend-item legend-flagged">
          <span className="legend-icon">🚩</span> Flagged
        </span>
        {mode === 'review' && (
          <>
            <span className="legend-item legend-correct">
              <span className="legend-icon">✓</span> Correct
            </span>
            <span className="legend-item legend-incorrect">
              <span className="legend-icon">✗</span> Incorrect
            </span>
          </>
        )}
      </div>

      <div className="palette-grid" role="grid" aria-label="Question Navigation Palette">
        {paletteItems.map(item => {
          const isCurrent = item.index === currentIndex;
          let statusClass = 'unanswered';
          let shapeIcon = '○';

          if (mode === 'review') {
            if (item.isCorrect === true) {
              statusClass = 'correct';
              shapeIcon = '✓';
            } else if (item.isCorrect === false) {
              statusClass = 'incorrect';
              shapeIcon = '✗';
            }
          } else {
            if (item.isAnswered) {
              statusClass = 'answered';
              shapeIcon = '●';
            }
          }

          if (item.isFlagged) {
            shapeIcon = '🚩';
          }

          return (
            <button
              key={item.index}
              className={`palette-btn ${statusClass} ${isCurrent ? 'current' : ''} ${
                item.isFlagged ? 'flagged' : ''
              }`}
              onClick={() => onSelectIndex(item.index)}
              onKeyDown={e => handleKeyDown(e, item.index)}
              aria-label={`Question ${item.number}, ${
                item.isFlagged ? 'Flagged' : item.isAnswered ? 'Answered' : 'Unanswered'
              }`}
            >
              <span className="btn-num">{item.number}</span>
              <span className="btn-shape">{shapeIcon}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});
