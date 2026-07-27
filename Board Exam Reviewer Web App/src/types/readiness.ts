// Readiness Score ? Types & Interfaces
// Every interface flows into B1.2-B1.5.

/** Normalized answer event from any source (study, mock, short test). */
export interface AnswerEvent {
  questionId: string;
  categoryId: string;
  isCorrect: boolean;
  timestamp: string; // ISO date
  source: 'study' | 'mock' | 'short_test';
  /** Weight multiplier: study=1, short_test=2, mock=3 */
  sourceWeight: number;
}

/** Category-performance snapshot. */
export interface CategorySnapshot {
  categoryId: string;
  correct: number;
  total: number;
  accuracy: number; // 0-1
  weightedCorrect: number;
  weightedTotal: number;
}

/** Readiness score output ? what we show the user. */
export interface ReadinessResult {
  /** 0-100 estimated readiness score */
  score: number;
  /** 80% = passing threshold for CSE */
  passingThreshold: number;
  /** Confidence level based on data volume */
  confidence: 'very_low' | 'low' | 'medium' | 'high';
  /** Confidence interval e.g. +/- 5% */
  confidenceInterval: number;
  /** Trend direction from recency analysis */
  trend: 'improving' | 'stable' | 'declining' | 'insufficient_data';
  /** Category breakdowns */
  categories: CategorySnapshot[];
  /** Total weighted questions analyzed */
  totalWeightedQuestions: number;
  /** Human-readable summary */
  message: string;
  /** Breakdown for the "Where to focus" section */
  weakestCategory: string | null;
  strongestCategory: string | null;
}

/** Inputs needed to calculate readiness. */
export interface ReadinessInputs {
  studyAttempts: AnswerEvent[];
  mockAttempts: AnswerEvent[];
  shortTestAttempts: AnswerEvent[];
}
