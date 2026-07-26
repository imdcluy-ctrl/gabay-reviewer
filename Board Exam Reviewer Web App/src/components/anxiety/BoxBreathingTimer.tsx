import React, { useState, useEffect, useRef } from 'react';
import {
  phaseAt,
  type BreathState,
  BREATH_PHASE_LABELS,
} from '../../lib/boxBreathing';
import './BoxBreathingTimer.css';

export const BoxBreathingTimer: React.FC = () => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [breathState, setBreathState] = useState<BreathState>({
    phase: 'inhale',
    phaseIndex: 0,
    phaseProgress: 0,
    secondsRemainingInPhase: 4,
    currentCycle: 1,
    elapsedMs: 0,
  });

  const startTimeRef = useRef<number | null>(null);
  const pausedElapsedRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    if (startTimeRef.current === null) {
      startTimeRef.current = performance.now() - pausedElapsedRef.current;
    }

    const tick = () => {
      const now = performance.now();
      const elapsed = now - (startTimeRef.current || now);
      pausedElapsedRef.current = elapsed;

      const newState = phaseAt(elapsed);
      setBreathState(newState);

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isActive]);

  const handleStart = () => {
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
    startTimeRef.current = null;
  };

  const handleReset = () => {
    setIsActive(false);
    startTimeRef.current = null;
    pausedElapsedRef.current = 0;
    setBreathState({
      phase: 'inhale',
      phaseIndex: 0,
      phaseProgress: 0,
      secondsRemainingInPhase: 4,
      currentCycle: 1,
      elapsedMs: 0,
    });
  };

  const labels = BREATH_PHASE_LABELS[breathState.phase];

  // Visual scale calculation for pulse circle
  let scale = 1.0;
  if (breathState.phase === 'inhale') {
    scale = 0.75 + 0.25 * breathState.phaseProgress;
  } else if (breathState.phase === 'holdFull') {
    scale = 1.0;
  } else if (breathState.phase === 'exhale') {
    scale = 1.0 - 0.25 * breathState.phaseProgress;
  } else {
    scale = 0.75;
  }

  return (
    <div className="box-breathing-card">
      <div className="breathing-header">
        <h3 className="breathing-title">4-4-4-4 Box Breathing Exercise</h3>
        <p className="breathing-subtitle">
          Calms the nervous system and lowers acute exam anxiety in 2 minutes.
        </p>
      </div>

      <div
        className="breathing-visual-area"
        aria-live="polite"
        aria-atomic="true"
      >
        {/* Animated breathing ring */}
        <div
          className="breathing-circle-outer"
          style={{ transform: `scale(${scale})` }}
        >
          <div className="breathing-circle-inner">
            <span className="breathing-count-number">
              {breathState.secondsRemainingInPhase}
            </span>
            <span className="breathing-phase-name">{labels.en}</span>
          </div>
        </div>

        <div className="breathing-instruction">{labels.instruction}</div>
        <div className="breathing-cycle-badge">
          Cycle {breathState.currentCycle}
        </div>
      </div>

      <div className="breathing-controls">
        {!isActive ? (
          <button type="button" className="btn-breath-primary" onClick={handleStart}>
            {pausedElapsedRef.current > 0 ? 'Resume Exercise' : 'Start Breathing'}
          </button>
        ) : (
          <button type="button" className="btn-breath-secondary" onClick={handlePause}>
            Pause
          </button>
        )}

        <button
          type="button"
          className="btn-breath-text"
          onClick={handleReset}
          disabled={pausedElapsedRef.current === 0}
        >
          Reset
        </button>
      </div>
    </div>
  );
};
