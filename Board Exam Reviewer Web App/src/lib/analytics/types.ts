// Deep Analytics Types (§3.3, INV-028)

import type { ErrorTagId } from '../errorTags';

export type StatsWindow = 'last_30_mocks' | 'last_90_days' | 'all_time';

export interface SubtopicMasteryItem {
  categoryId: string;
  categoryName: string;
  subtopic: string;
  totalAnswered: number;
  totalCorrect: number;
  accuracy: number; // 0.0 .. 1.0
  heatBin: 'insufficient_data' | 'low' | 'mid' | 'high'; // <3 = insufficient_data, <0.50 = low, <0.80 = mid, >=0.80 = high
}

export interface ScatterPoint {
  attemptId: string;
  mockExamId: string;
  dateStr: string;
  medianTimeSpentSeconds: number;
  accuracy: number; // 0.0 .. 1.0
  totalQuestions: number;
}

export interface StaminaPoint {
  attemptId: string;
  dateStr: string;
  q1Accuracy: number; // 0.0 .. 1.0
  q4Accuracy: number; // 0.0 .. 1.0
  fatigueDelta: number; // Q1 - Q4
  hasFatigueWarning: boolean; // delta >= 0.15 (INV-023)
}

export interface CategoryRadarItem {
  categoryId: string;
  categoryName: string;
  userAccuracy: number; // 0.0 .. 1.0
  passingTarget: number; // 0.80 (INV-008)
  status: 'passed' | 'needs_work';
}

export interface ErrorTagStatItem {
  tag: ErrorTagId;
  count: number;
  percentage: number;
}

export interface StatisticsModel {
  hasData: boolean;
  totalMockAttempts: number;
  totalPracticeAnswers: number;
  window: StatsWindow;
  categoryRadar: CategoryRadarItem[];
  subtopicMastery: SubtopicMasteryItem[];
  speedAccuracyScatter: ScatterPoint[];
  staminaProgression: StaminaPoint[];
  errorTagBreakdown: ErrorTagStatItem[];
}
