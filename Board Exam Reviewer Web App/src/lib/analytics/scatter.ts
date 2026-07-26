// Speed vs Accuracy Scatter Plot Calculation (§3.3, INV-028d)

import type { MockExamAttempt, MockExamAnswer } from '../../types/mockExam';
import type { ScatterPoint } from './types';

/**
 * INV-028d: Scatter: x = median(time_spent_seconds), y = accuracy.
 * Drops attempts with zero answered items.
 */
export function computeSpeedAccuracyScatter(
  attempts: MockExamAttempt[],
  answersMap: Map<string, MockExamAnswer[]>
): ScatterPoint[] {
  const points: ScatterPoint[] = [];

  for (const attempt of attempts) {
    const answers = answersMap.get(attempt.id) || [];
    if (answers.length === 0) continue;

    const times = answers.map(a => a.time_spent_seconds || 0).sort((a, b) => a - b);
    const mid = Math.floor(times.length / 2);
    const tMid = times[mid] || 0;
    const tMidMinus = times[mid - 1] || 0;
    const medianTimeSpentSeconds = times.length % 2 !== 0 ? tMid : Math.round((tMidMinus + tMid) / 2);

    const correctCount = answers.filter(a => a.is_correct).length;
    const accuracy = answers.length > 0 ? correctCount / answers.length : 0;

    points.push({
      attemptId: attempt.id,
      mockExamId: attempt.mock_exam_id,
      dateStr: new Date(attempt.started_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      medianTimeSpentSeconds,
      accuracy,
      totalQuestions: answers.length,
    });
  }

  return points;
}
