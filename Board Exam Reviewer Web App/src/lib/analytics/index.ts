// Master Statistics Model Builder (§3.3, INV-028)

import type { MockExamAttempt, MockExamAnswer } from '../../types/mockExam';
import type { LocalAttempt } from '../db';
import type { ErrorTagRecord } from '../errorTags';
import { computeDistribution } from '../errorTags';
import type { StatisticsModel, StatsWindow, ErrorTagStatItem } from './types';
import { filterAttemptsByWindow } from './windows';
import { computeSubtopicMastery } from './mastery';
import { computeSpeedAccuracyScatter } from './scatter';
import { computeStaminaProgression } from './stamina';
import { computeCategoryRadar } from './radar';

export interface BuildStatisticsInput {
  mockAttempts: MockExamAttempt[];
  answersMap: Map<string, MockExamAnswer[]>;
  practiceAttempts?: LocalAttempt[];
  errorTags?: ErrorTagRecord[];
  window?: StatsWindow;
}

/**
 * INV-028: Master builder constructing StatisticsModel from hydrated attempt & answer rows.
 * Reads ONLY snapshot-backed data (INV-019).
 */
export function buildStatisticsModel(input: BuildStatisticsInput): StatisticsModel {
  const windowSelection = input.window || 'last_30_mocks';
  const filteredMockAttempts = filterAttemptsByWindow(input.mockAttempts, windowSelection);
  const totalMockAttempts = filteredMockAttempts.length;

  // Flatten answers across filtered attempts
  const allFilteredAnswers: MockExamAnswer[] = [];
  filteredMockAttempts.forEach(att => {
    const ansList = input.answersMap.get(att.id) || [];
    allFilteredAnswers.push(...ansList);
  });

  const categoryRadar = computeCategoryRadar(allFilteredAnswers);
  const subtopicMastery = computeSubtopicMastery(allFilteredAnswers);
  const speedAccuracyScatter = computeSpeedAccuracyScatter(filteredMockAttempts, input.answersMap);
  const staminaProgression = computeStaminaProgression(filteredMockAttempts, input.answersMap);

  // Compute Error Tag Breakdown from Stage 3.1
  const tagIds = (input.errorTags || []).map(t => t.tag);
  const incorrectCount = allFilteredAnswers.filter(a => !a.is_correct).length;
  const distRes = computeDistribution(tagIds, Math.max(incorrectCount, tagIds.length));

  const errorTagBreakdown: ErrorTagStatItem[] = distRes.items.map(i => ({
    tag: i.tag,
    count: i.count,
    percentage: i.percentage,
  }));

  const totalPracticeAnswers = input.practiceAttempts ? input.practiceAttempts.length : 0;
  const hasData = totalMockAttempts > 0 || totalPracticeAnswers > 0;

  return {
    hasData,
    totalMockAttempts,
    totalPracticeAnswers,
    window: windowSelection,
    categoryRadar,
    subtopicMastery,
    speedAccuracyScatter,
    staminaProgression,
    errorTagBreakdown,
  };
}
