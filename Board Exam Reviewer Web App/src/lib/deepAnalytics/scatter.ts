// Speed vs Accuracy Scatter Plot Calculation (§3.3, INV-028d)

import type { UnifiedAnswer, ScatterPoint } from './types';

/**
 * INV-028d: Scatter: x = median(time_spent_seconds), y = accuracy.
 * Groups answers by session (examId or sessionId).
 */
export function computeSpeedAccuracyScatter(
  answers: UnifiedAnswer[]
): ScatterPoint[] {
  const points: ScatterPoint[] = [];

  // Group by examId or sessionId
  const sessionMap = new Map<string, UnifiedAnswer[]>();
  answers.forEach(ans => {
    const sId = ans.examId || ans.sessionId || 'standalone';
    const list = sessionMap.get(sId) || [];
    list.push(ans);
    sessionMap.set(sId, list);
  });

  sessionMap.forEach((ansList, sId) => {
    if (ansList.length === 0) return;

    const times = ansList.map(a => Math.round((a.timeSpentMs || 0) / 1000)).sort((a, b) => a - b);
    const mid = Math.floor(times.length / 2);
    const tMid = times[mid] || 0;
    const tMidMinus = times[mid - 1] || 0;
    const medianTimeSpentSeconds = times.length % 2 !== 0 ? tMid : Math.round((tMidMinus + tMid) / 2);

    const correctCount = ansList.filter(a => a.isCorrect).length;
    const accuracy = ansList.length > 0 ? correctCount / ansList.length : 0;
    const firstAns = ansList[0];
    const dateStr = firstAns ? new Date(firstAns.answeredAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Today';

    points.push({
      attemptId: sId,
      mockExamId: firstAns?.examId || 'practice',
      dateStr,
      medianTimeSpentSeconds,
      accuracy,
      totalQuestions: ansList.length,
    });
  });

  return points;
}
