// Master Statistics Model Builder (§3.3, INV-028)

import type { ErrorTagRecord } from '../errorTags';
import { computeDistribution } from '../errorTags';
import type { StatisticsModel, StatsWindow, ErrorTagStatItem, UnifiedAnswer } from './types';
import { computeSubtopicMastery } from './mastery';
import { computeSpeedAccuracyScatter } from './scatter';
import { computeStaminaProgression } from './stamina';
import { computeCategoryRadar } from './radar';

export interface BuildStatisticsInput {
  answers: UnifiedAnswer[];
  errorTags?: ErrorTagRecord[];
  window?: StatsWindow;
}

/**
 * INV-028: Master builder constructing StatisticsModel from UnifiedAnswer pipeline.
 */
export function buildStatisticsModel(input: BuildStatisticsInput): StatisticsModel {
  const windowSelection = input.window || 'all_time';
  const answers = input.answers || [];

  const categoryRadar = computeCategoryRadar(answers);
  const subtopicMastery = computeSubtopicMastery(answers);
  const speedAccuracyScatter = computeSpeedAccuracyScatter(answers);
  const staminaProgression = computeStaminaProgression(answers);

  // Compute Error Tag Breakdown from Stage 3.1
  const tagIds = (input.errorTags || []).map(t => t.tag);
  const incorrectCount = answers.filter(a => !a.isCorrect).length;
  const distRes = computeDistribution(tagIds, Math.max(incorrectCount, tagIds.length));

  const errorTagBreakdown: ErrorTagStatItem[] = distRes.items.map(i => ({
    tag: i.tag,
    count: i.count,
    percentage: i.percentage,
  }));

  const mockAnswersCount = answers.filter(a => a.source === 'mock_exam').length;
  const practiceAnswersCount = answers.filter(a => a.source !== 'mock_exam').length;
  const hasData = answers.length > 0;

  return {
    hasData,
    totalMockAttempts: mockAnswersCount,
    totalPracticeAnswers: practiceAnswersCount,
    window: windowSelection,
    categoryRadar,
    subtopicMastery,
    speedAccuracyScatter,
    staminaProgression,
    errorTagBreakdown,
  };
}

export * from './types';
export * from './mappers';
