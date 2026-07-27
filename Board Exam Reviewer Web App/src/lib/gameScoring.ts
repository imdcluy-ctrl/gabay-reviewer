import type { DailyStreakState, StreakSettings } from '../types/game';

/** Default game settings. */
export const DEFAULT_STREAK_SETTINGS: StreakSettings = {
  maxLives: 3,
  streakMilestones: [3, 5, 10, 15, 25],
  timePerQuestionSec: 0, // untimed
  blend: {
    unseenFraction: 0.50,
    weakCategoryFraction: 0.25,
    spacedReviewFraction: 0.25,
  },
};

/** Create a fresh session state. */
export function createInitialState(bestStreakEver: number): DailyStreakState {
  return {
    status: 'playing',
    currentStreak: 0,
    totalAnswered: 0,
    totalCorrect: 0,
    livesRemaining: DEFAULT_STREAK_SETTINGS.maxLives,
    freezesAvailable: 0,
    bestStreakEver,
    score: 0,
  };
}

/** Process one answer. Returns the updated state (immutable). */
export function processAnswer(
  state: DailyStreakState,
  isCorrect: boolean,
  settings: StreakSettings = DEFAULT_STREAK_SETTINGS
): DailyStreakState {
  const next = { ...state };
  next.totalAnswered += 1;

  if (isCorrect) {
    next.currentStreak += 1;
    next.totalCorrect += 1;

    // Check streak milestone for freeze award
    if (settings.streakMilestones.includes(next.currentStreak) && !next.freezesAvailable) {
      next.freezesAvailable += 1;
    }
  } else {
    // Freeze token auto-applies to save the streak
    if (next.freezesAvailable > 0) {
      next.freezesAvailable -= 1;
      // Streak continues, but question counts as missed
      next.totalCorrect += 0; // no change
    } else {
      // No freeze ? lose a life and reset streak
      next.livesRemaining -= 1;
      next.currentStreak = 0;
    }

    if (next.livesRemaining <= 0) {
      next.status = 'done';
    }
  }

  next.bestStreakEver = Math.max(next.bestStreakEver, next.currentStreak);
  next.score = calculateScore(next.totalCorrect, next.bestStreakEver);
  return next;
}

/** Score formula: totalCorrect weighted by best streak. */
export function calculateScore(totalCorrect: number, bestStreak: number): number {
  const streakMultiplier = 1 + Math.min(bestStreak * 0.05, 1.0); // max 2x at streak >= 20
  return Math.round(totalCorrect * streakMultiplier);
}

/** Check if the game should end based on state. */
export function isGameOver(state: DailyStreakState): boolean {
  return state.livesRemaining <= 0 || state.status === 'done';
}

/** Check if a freeze should be awarded at the current streak. */
export function shouldAwardFreeze(
  currentStreak: number,
  settings: StreakSettings = DEFAULT_STREAK_SETTINGS
): boolean {
  return settings.streakMilestones.includes(currentStreak);
}

/** Load saved freeze tokens from localStorage. */
export function loadSavedFreezes(): number {
  try { return Number(localStorage.getItem('gabay_freeze_tokens')) || 0; }
  catch { return 0; }
}

/** Save freeze tokens to localStorage. */
export function saveFreezeTokens(count: number): void {
  localStorage.setItem('gabay_freeze_tokens', String(Math.max(0, count)));
}

/** Award a freeze token (capped at 3 max). */
export function awardFreezeToken(current: number): number {
  const updated = Math.min(current + 1, 3);
  saveFreezeTokens(updated);
  return updated;
}

/** Check if the daily restore is still available. */
export function canRestoreToday(): boolean {
  try {
    const key = "gabay_streak_restore_date";
    const today = new Date().toLocaleDateString("en-CA");
    return localStorage.getItem(key) !== today;
  } catch { return true; }
}

/** Mark restore as used for today. */
export function markRestoreUsed(): void {
  const today = new Date().toLocaleDateString("en-CA");
  localStorage.setItem("gabay_streak_restore_date", today);
}

