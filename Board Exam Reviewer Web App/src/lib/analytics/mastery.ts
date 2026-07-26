// Subtopic Mastery Heatmap Math (§3.3, INV-028b, INV-028c)

import type { MockExamAnswer } from '../../types/mockExam';
import type { SubtopicMasteryItem } from './types';
import { CATEGORIES } from '../constants';

/**
 * INV-028b: Subtopic mastery = correct/answered in window; answered < 3 -> 'insufficient_data'.
 * INV-028c: Bins: insufficient_data | low (<0.50) | mid (<0.80) | high (>=0.80)
 */
export function computeSubtopicMastery(
  answers: MockExamAnswer[]
): SubtopicMasteryItem[] {
  const map = new Map<string, {
    categoryId: string;
    subtopic: string;
    totalAnswered: number;
    totalCorrect: number;
  }>();

  answers.forEach(ans => {
    const snap = ans.content_snapshot;
    if (!snap) return;

    const categoryId = ans.section_id || snap.category_id || 'unknown';
    const subtopic = snap.subtopic || 'General Topics';
    const key = `${categoryId}:${subtopic}`;

    const existing = map.get(key) || {
      categoryId,
      subtopic,
      totalAnswered: 0,
      totalCorrect: 0,
    };

    existing.totalAnswered += 1;
    if (ans.is_correct) {
      existing.totalCorrect += 1;
    }

    map.set(key, existing);
  });

  const result: SubtopicMasteryItem[] = [];

  map.forEach(item => {
    const categoryName = CATEGORIES.find(c => c.id === item.categoryId)?.name || item.categoryId;
    const accuracy = item.totalAnswered > 0 ? item.totalCorrect / item.totalAnswered : 0;

    let heatBin: 'insufficient_data' | 'low' | 'mid' | 'high';
    if (item.totalAnswered < 3) {
      heatBin = 'insufficient_data';
    } else if (accuracy < 0.50) {
      heatBin = 'low';
    } else if (accuracy < 0.80) {
      heatBin = 'mid';
    } else {
      heatBin = 'high';
    }

    result.push({
      categoryId: item.categoryId,
      categoryName,
      subtopic: item.subtopic,
      totalAnswered: item.totalAnswered,
      totalCorrect: item.totalCorrect,
      accuracy,
      heatBin,
    });
  });

  // Sort by category then subtopic
  return result.sort((a, b) => a.categoryId.localeCompare(b.categoryId) || a.subtopic.localeCompare(b.subtopic));
}
