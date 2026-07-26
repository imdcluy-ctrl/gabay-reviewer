// Chronological Stamina Progression Calculation (§3.3, INV-028e)

import type { MockExamAttempt, MockExamAnswer } from '../../types/mockExam';
import type { StaminaPoint } from './types';
import { calculateFatigueMetrics } from '../fatigue';

/**
 * INV-028e: Stamina: Per attempt wraps calculateFatigueMetrics for Q1-Q4 & delta.
 * Fatigue flag delta >= 0.15 (INV-023) displayed, not redefined.
 */
export function computeStaminaProgression(
  attempts: MockExamAttempt[],
  answersMap: Map<string, MockExamAnswer[]>
): StaminaPoint[] {
  const points: StaminaPoint[] = [];

  for (const attempt of attempts) {
    const answers = answersMap.get(attempt.id) || [];
    if (answers.length < 4) continue; // Requires at least 4 items for quartile calculation

    const fatigue = calculateFatigueMetrics(answers);
    const q1Accuracy = fatigue.quartileAccuracies.q1.percentage / 100;
    const q4Accuracy = fatigue.quartileAccuracies.q4.percentage / 100;

    points.push({
      attemptId: attempt.id,
      dateStr: new Date(attempt.started_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      q1Accuracy,
      q4Accuracy,
      fatigueDelta: fatigue.fatigueDelta,
      hasFatigueWarning: fatigue.hasFatigueDeficit, // INV-023 fatigue warning
    });
  }

  return points;
}
