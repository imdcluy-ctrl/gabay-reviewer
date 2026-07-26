// Chronological Stamina Progression Calculation (§3.3, INV-028e)

import type { UnifiedAnswer, StaminaPoint } from './types';
import { calculateFatigueMetrics } from '../fatigue';

/**
 * INV-028e: Stamina: Per exam/session wraps calculateFatigueMetrics for Q1-Q4 & delta.
 * Requires at least 4 items in a session to calculate fatigue.
 */
export function computeStaminaProgression(
  answers: UnifiedAnswer[]
): StaminaPoint[] {
  const points: StaminaPoint[] = [];

  // Group answers by examId or sessionId
  const sessionMap = new Map<string, UnifiedAnswer[]>();
  answers.forEach(ans => {
    // Only process sessions with a clear session identifier
    const sId = ans.examId || ans.sessionId;
    if (!sId) return;

    const list = sessionMap.get(sId) || [];
    list.push(ans);
    sessionMap.set(sId, list);
  });

  sessionMap.forEach((ansList, sId) => {
    if (ansList.length < 4) return; // Requires at least 4 items for quartile calculation

    // Map to shape required by calculateFatigueMetrics
    const fatigueAns = ansList.map((a, idx) => ({
      question_index: idx,
      chosen_option: a.selectedAnswer,
      is_correct: a.isCorrect,
      time_spent_seconds: Math.round((a.timeSpentMs || 0) / 1000),
      content_snapshot: {
        correct_option: a.correctAnswer,
      },
    }));

    const fatigue = calculateFatigueMetrics(fatigueAns as any);
    const q1Accuracy = fatigue.quartileAccuracies.q1.percentage / 100;
    const q4Accuracy = fatigue.quartileAccuracies.q4.percentage / 100;
    const firstAns = ansList[0];

    points.push({
      attemptId: sId,
      dateStr: firstAns ? new Date(firstAns.answeredAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Today',
      q1Accuracy,
      q4Accuracy,
      fatigueDelta: fatigue.fatigueDelta,
      hasFatigueWarning: fatigue.hasFatigueDeficit,
    });
  });

  return points;
}
