import { db } from './db';
import { analytics } from './analytics';
import { EVENTS } from './events';

// ── Types ──────────────────────────────────────────────────────

export interface StreakEngagementDay {
  date: string;
  playedScored: boolean;
  playedPractice: boolean;
  finalStreak: number;
  totalAnswered: number;
  totalCorrect: number;
  freezesUsed: number;
  restoreUsed: boolean;
}

// ── Engagement tracking ────────────────────────────────────────

const STREAK_PARTICIPATION_KEY = 'gabay_streak_participation_dates';

function getToday(): string {
  return new Date().toLocaleDateString('en-CA');
}

function loadParticipationDates(): Set<string> {
  try {
    const raw = localStorage.getItem(STREAK_PARTICIPATION_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch { /* ignore */ }
  return new Set();
}

function saveParticipationDates(dates: Set<string>): void {
  localStorage.setItem(STREAK_PARTICIPATION_KEY, JSON.stringify([...dates]));
}

// ── Public API ─────────────────────────────────────────────────
export function trackStreakSessionStarted() {
  analytics.track(EVENTS.STREAK_SESSION_STARTED);
  const today = getToday();
  const dates = loadParticipationDates();
  if (!dates.has(today)) {
    dates.add(today);
    saveParticipationDates(dates);
    analytics.track(EVENTS.STREAK_DAILY_PARTICIPATION, { date: today });
  }
}



export function trackStreakQuestionAnswered(correct: boolean, currentStreak: number) {
  analytics.track(EVENTS.STREAK_QUESTION_ANSWERED, { correct, currentStreak });
  analytics.track(
    correct ? EVENTS.STREAK_QUESTION_CORRECT : EVENTS.STREAK_QUESTION_WRONG,
    { currentStreak },
  );
}

export function trackStreakFreezeUsed(streakAtUsage: number) {
  analytics.track(EVENTS.STREAK_FREEZE_USED, { streakAtUsage });
}

export function trackStreakMilestoneReached(milestone: number) {
  analytics.track(EVENTS.STREAK_MILESTONE_REACHED, { milestone });
}

export function trackStreakSessionCompleted(params: {
  finalStreak: number;
  totalAnswered: number;
  totalCorrect: number;
  freezesUsed: number;
  score: number;
  durationSeconds: number;
}) {
  analytics.track(EVENTS.STREAK_SESSION_COMPLETED, {
    ...params,
    accuracy:
      params.totalAnswered > 0
        ? Math.round((params.totalCorrect / params.totalAnswered) * 100)
        : 0,
  });
}

export function trackStreakRestoreUsed() {
  analytics.track(EVENTS.STREAK_RESTORE_USED);
}

export function trackStreakPracticeModeEntered() {
  analytics.track(EVENTS.STREAK_PRACTICE_MODE_ENTERED);
}

// ── Engagement statistics (for in-app display) ─────────────────

export interface StreakEngagementStats {
  totalDaysPlayed: number;
  currentPlayStreak: number;
  bestPlayStreak: number;
  avgFinalStreak: number;
  totalSessions: number;
}

/**
 * Compute engagement statistics from stored streak sessions.
 */
export async function computeStreakEngagementStats(
  userId: string,
): Promise<StreakEngagementStats> {
  const sessions = await db.streak_sessions
    .where('localUserId')
    .equals(userId)
    .toArray();

  const totalSessions = sessions.length;

  if (totalSessions === 0) {
    return {
      totalDaysPlayed: 0,
      currentPlayStreak: 0,
      bestPlayStreak: 0,
      avgFinalStreak: 0,
      totalSessions: 0,
    };
  }

  const avgFinalStreak = Math.round(
    sessions.reduce((sum, s) => sum + s.finalStreak, 0) / totalSessions,
  );

  const dates = loadParticipationDates();
  const sortedDates = [...dates].sort((a, b) => a.localeCompare(b));
  const today = getToday();

  // Current play streak
  let currentPlayStreak = 0;
  let checkDate = new Date(today);
  if (!dates.has(today)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }
  while (true) {
    const dStr = checkDate.toLocaleDateString('en-CA');
    if (dates.has(dStr)) {
      currentPlayStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Best play streak
  let bestPlayStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dStr of sortedDates) {
    const d = new Date(dStr + 'T00:00:00');
    if (prevDate) {
      const diffDays =
        (d.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays === 1) {
        tempStreak++;
      } else {
        if (tempStreak > bestPlayStreak) bestPlayStreak = tempStreak;
        tempStreak = 1;
      }
    } else {
      tempStreak = 1;
    }
    prevDate = d;
  }
  if (tempStreak > bestPlayStreak) bestPlayStreak = tempStreak;

  return {
    totalDaysPlayed: dates.size,
    currentPlayStreak,
    bestPlayStreak,
    avgFinalStreak,
    totalSessions,
  };
}

