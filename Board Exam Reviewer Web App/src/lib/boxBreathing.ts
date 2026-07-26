// Pure timing math for Box Breathing 4-4-4-4 (§3.2, INV-027c)

export type BreathPhase = 'inhale' | 'holdFull' | 'exhale' | 'holdEmpty';

export interface BreathState {
  phase: BreathPhase;
  phaseIndex: number; // 0..3
  phaseProgress: number; // 0.0 .. 1.0 within current phase
  secondsRemainingInPhase: number; // 1 .. 4
  currentCycle: number; // 1-based cycle count
  elapsedMs: number;
}

export const BREATH_PHASES: BreathPhase[] = ['inhale', 'holdFull', 'exhale', 'holdEmpty'];
export const PHASE_DURATION_MS = 4000;
export const CYCLE_DURATION_MS = 16000; // 4 * 4000

export const BREATH_PHASE_LABELS: Record<BreathPhase, { en: string; tl: string; instruction: string }> = {
  inhale: {
    en: 'Inhale',
    tl: 'Huminga nang malalim',
    instruction: 'Breathe in slowly through your nose...',
  },
  holdFull: {
    en: 'Hold Breath',
    tl: 'Pigilan ang hininga',
    instruction: 'Hold your breath comfortably...',
  },
  exhale: {
    en: 'Exhale',
    tl: 'Ilabas ang hininga',
    instruction: 'Exhale fully through your mouth...',
  },
  holdEmpty: {
    en: 'Hold Empty',
    tl: 'Manatiling nakahinga',
    instruction: 'Pause before the next breath...',
  },
};

/**
 * INV-027c: Derives breath phase and progress from elapsed time anchored at start.
 * Never drifts like chained setTimeout.
 */
export function phaseAt(elapsedMs: number): BreathState {
  const safeElapsed = Math.max(0, elapsedMs);
  const currentCycle = Math.floor(safeElapsed / CYCLE_DURATION_MS) + 1;
  const cycleTimeMs = safeElapsed % CYCLE_DURATION_MS;

  const phaseIndex = Math.floor(cycleTimeMs / PHASE_DURATION_MS);
  const phase = BREATH_PHASES[phaseIndex] || 'inhale';

  const phaseTimeMs = cycleTimeMs % PHASE_DURATION_MS;
  const phaseProgress = phaseTimeMs / PHASE_DURATION_MS;
  const secondsRemainingInPhase = Math.ceil((PHASE_DURATION_MS - phaseTimeMs) / 1000);

  return {
    phase,
    phaseIndex,
    phaseProgress,
    secondsRemainingInPhase: secondsRemainingInPhase <= 0 ? 1 : secondsRemainingInPhase,
    currentCycle,
    elapsedMs: safeElapsed,
  };
}
