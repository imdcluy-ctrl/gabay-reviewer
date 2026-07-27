// Streak Mode — Game Types & Interfaces
// Every interface flows into A1.2 (scoring) and A1.3 (selection).

/** A single question served in a streak session, tagged with how it was selected. */
export type BlendSource = 'unseen' | 'weak_category' | 'spaced_review';

export interface StreakQuestion {
  questionId: string;
  categoryId: string;
  blendSource: BlendSource;
}

/** One "get out of jail free" token — earned via streak milestones. */
export interface FreezeToken {
  earnedAtStreak: number;
  used: boolean;
}

/** Today's live streak session state. Stored only in React state, not persisted. */
export type StreakStatus = 'unplayed' | 'playing' | 'done';

export interface DailyStreakState {
  status: StreakStatus;
  currentStreak: number;
  totalAnswered: number;
  totalCorrect: number;
  livesRemaining: number;
  freezesAvailable: number;
  bestStreakEver: number;
  score: number;
}

/** Persisted session record. Saved to IndexedDB after each daily session. */
export interface StreakSession {
  id: string;
  localUserId: string;
  date: string;
  finalStreak: number;
  totalCorrect: number;
  totalAnswered: number;
  score: number;
  freezesUsed: number;
  freezesEarned: number;
  durationSeconds: number;
  createdAt: string;
}

/** Configurable blend ratios for question selection. */
export interface StreakBlend {
  unseenFraction: number;
  weakCategoryFraction: number;
  spacedReviewFraction: number;
}

/** Static game configuration. */
export interface StreakSettings {
  maxLives: number;
  streakMilestones: number[];
  timePerQuestionSec: number;
  blend: StreakBlend;
}
