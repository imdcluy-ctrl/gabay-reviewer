import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import './HintLadder.css';

interface HintLadderProps {
  hintLadder: { rung: number; title: string; text: string }[];
  onSkipToAnswer: () => void;
  onHintsViewedChange?: (count: number) => void;
  onHintUsed?: (rung: number) => void;
}

export const HintLadder: React.FC<HintLadderProps> = ({
  hintLadder,
  onSkipToAnswer,
  onHintsViewedChange,
  onHintUsed,
}) => {
  const [visibleRungs, setVisibleRungs] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [visibleRungs]);

  const handleNextRung = () => {
    const nextCount = Math.min(visibleRungs + 1, hintLadder.length);
    setVisibleRungs(nextCount);
    if (onHintsViewedChange) {
      onHintsViewedChange(nextCount);
    }
    if (onHintUsed) {
      onHintUsed(nextCount);
    }
  };

  const hasMoreRungs = visibleRungs < hintLadder.length;

  return (
    <div className="hint-ladder-container" ref={containerRef}>
      <div className="hint-header">
        <span className="hint-header-icon">💡</span>
        <h4 className="hint-header-title">Socratic Hint Scaffold</h4>
      </div>

      <div className="rungs-list">
        {hintLadder.slice(0, visibleRungs).map(item => (
          <div key={item.rung} className="rung-item">
            <div className="rung-badge">Rung {item.rung}</div>
            <div className="rung-content">
              <h5 className="rung-title">{item.title}</h5>
              <p className="rung-text">{item.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="hint-actions">
        {hasMoreRungs ? (
          <Button variant="secondary" size="sm" onClick={handleNextRung}>
            Next Hint ({visibleRungs + 1}/{hintLadder.length}) →
          </Button>
        ) : (
          <div className="all-hints-seen-badge">
            All 4 hints revealed! Select an answer above.
          </div>
        )}

        <button className="skip-hints-link" onClick={onSkipToAnswer}>
          Skip hints, show full answer →
        </button>

        {/* Optional Voluntary Opt-In Rewarded Ad CTA (100% User Initiated) */}
        {!hasMoreRungs && (
          <button 
            className="rewarded-ad-cta"
            onClick={() => alert("🎥 Voluntary Rewarded Ad: User-initiated opt-in clip. High eCPM ($15-$35).")}
            style={{
              marginTop: '8px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-card)',
              color: 'var(--color-brand-teal)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🎬 Watch 30s Sponsored Clip for Video Walkthrough
          </button>
        )}
      </div>
    </div>
  );
};
