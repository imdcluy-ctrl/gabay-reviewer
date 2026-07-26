// Attempt Filtering Windows (§3.3, INV-028g)

import type { MockExamAttempt } from '../../types/mockExam';
import type { StatsWindow } from './types';

/**
 * INV-028g: Filters completed mock exam attempts based on window selection.
 * Default: Last 30 completed mocks. Alt: Last 90 days or All Time.
 */
export function filterAttemptsByWindow(
  attempts: MockExamAttempt[],
  window: StatsWindow
): MockExamAttempt[] {
  // Sort chronologically (oldest first)
  const completed = attempts
    .filter(a => a.status === 'completed')
    .sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime());

  if (completed.length === 0) return [];

  if (window === 'last_30_mocks') {
    return completed.slice(-30);
  }

  if (window === 'last_90_days') {
    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
    return completed.filter(a => new Date(a.started_at).getTime() >= ninetyDaysAgo);
  }

  return completed; // all_time
}
