import { useState, useEffect, useRef, useCallback } from 'react';
import type { MockExamAttempt } from '../types/mockExam';

export interface ExamTimerHandlers {
  onTimeout: () => void;
  onWarning: (type: '15m' | '5m') => void;
  onIntegrityFlag: (flag: 'clock_anomaly') => void;
  persist?: (partial: Partial<MockExamAttempt>) => void;
}

export interface ExamTimerState {
  remainingSeconds: number;
  isExpired: boolean;
  isRunning: boolean;
  pausedAccumulatedMs: number;
  warningFired15m: boolean;
  warningFired5m: boolean;
  integrityFlag: 'none' | 'clock_anomaly';
}

export function useExamTimer(
  startedAtIso: string,
  durationMinutes: number,
  initialPausedAccumulatedMs: number = 0,
  initialIsRunning: boolean = true,
  handlers: ExamTimerHandlers
) {
  const startedAtEpoch = new Date(startedAtIso).getTime();
  const durationMs = durationMinutes * 60 * 1000;
  const deadlineEpochMs = startedAtEpoch + durationMs;

  const [pausedAccumulatedMs, setPausedAccumulatedMs] = useState<number>(initialPausedAccumulatedMs);
  const [isRunning, setIsRunning] = useState<boolean>(initialIsRunning);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    const rem = Math.max(0, Math.ceil((deadlineEpochMs - initialPausedAccumulatedMs - Date.now()) / 1000));
    return rem;
  });

  const [integrityFlag, setIntegrityFlag] = useState<'none' | 'clock_anomaly'>('none');
  const warning15FiredRef = useRef<boolean>(false);
  const warning5FiredRef = useRef<boolean>(false);
  const pausedAtEpochRef = useRef<number | null>(null);

  // Clock tamper tracking refs (INV-022)
  const lastWallTimeRef = useRef<number>(Date.now());
  const lastMonotonicTimeRef = useRef<number>(performance.now());

  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  });

  // Calculate remaining time from immutable deadline (INV-004)
  const computeRemainingSeconds = useCallback(() => {
    if (!isRunning) {
      return remainingSeconds;
    }
    const remMs = deadlineEpochMs - pausedAccumulatedMs - Date.now();
    return Math.max(0, Math.ceil(remMs / 1000));
  }, [deadlineEpochMs, pausedAccumulatedMs, isRunning, remainingSeconds]);

  // Main check-in & verification routine (INV-004, INV-006, INV-022)
  const checkTimerAndIntegrity = useCallback(() => {
    const nowWall = Date.now();
    const nowMonotonic = performance.now();

    // Clock-tamper check (INV-022)
    const wallDelta = nowWall - lastWallTimeRef.current;
    const monotonicDelta = nowMonotonic - lastMonotonicTimeRef.current;

    // If wall clock rolled back or jumped forward unexpectedly vs monotonic clock
    if (lastWallTimeRef.current > 0 && Math.abs(wallDelta - monotonicDelta) > 5000) {
      if (integrityFlag === 'none') {
        setIntegrityFlag('clock_anomaly');
        handlersRef.current.onIntegrityFlag('clock_anomaly');
      }
    }

    lastWallTimeRef.current = nowWall;
    lastMonotonicTimeRef.current = nowMonotonic;

    const remSec = computeRemainingSeconds();
    setRemainingSeconds(remSec);

    // Auto-submit trigger on deadline expiry (INV-006)
    if (remSec <= 0 && isRunning) {
      handlersRef.current.onTimeout();
      return;
    }

    // Warning triggers (M5)
    if (remSec <= 900 && remSec > 300 && !warning15FiredRef.current) {
      warning15FiredRef.current = true;
      handlersRef.current.onWarning('15m');
    }
    if (remSec <= 300 && remSec > 0 && !warning5FiredRef.current) {
      warning5FiredRef.current = true;
      handlersRef.current.onWarning('5m');
    }
  }, [computeRemainingSeconds, isRunning, integrityFlag]);

  // 1-second interval for display update (INV-025 throttled to 1/sec, no rAF for countdown logic)
  useEffect(() => {
    if (!isRunning) return;

    checkTimerAndIntegrity();
    const timerId = window.setInterval(checkTimerAndIntegrity, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [isRunning, checkTimerAndIntegrity]);

  // Foreground re-check listener (INV-006: fires auto-submit immediately when returning to tab)
  useEffect(() => {
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        checkTimerAndIntegrity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [checkTimerAndIntegrity]);

  // Pause / Resume methods (M2)
  const pauseTimer = useCallback(() => {
    if (!isRunning) return;
    pausedAtEpochRef.current = Date.now();
    setIsRunning(false);
  }, [isRunning]);

  const resumeTimer = useCallback(() => {
    if (isRunning) return;
    if (pausedAtEpochRef.current) {
      const duration = Date.now() - pausedAtEpochRef.current;
      setPausedAccumulatedMs(prev => prev + duration);
      pausedAtEpochRef.current = null;
    }
    setIsRunning(true);
  }, [isRunning]);

  return {
    remainingSeconds,
    isExpired: remainingSeconds <= 0,
    isRunning,
    pausedAccumulatedMs,
    integrityFlag,
    pauseTimer,
    resumeTimer,
  };
}
