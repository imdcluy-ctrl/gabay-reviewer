// 5-Axis Category Radar Math (§3.3, INV-028f)

import type { MockExamAnswer } from '../../types/mockExam';
import type { CategoryRadarItem } from './types';
import { CATEGORIES } from '../constants';

/**
 * INV-028f: Radar axes = 5 CSE categories.
 * Reference ring = 0.80 (INV-008 passing cutoff philosophy).
 */
export function computeCategoryRadar(answers: MockExamAnswer[]): CategoryRadarItem[] {
  const map = new Map<string, { total: number; correct: number }>();

  // Initialize all 5 canonical CSE categories
  const canonicalIds = ['verbal-ability', 'analytical-ability', 'numerical-ability', 'general-information', 'clerical-ability'];
  canonicalIds.forEach(id => map.set(id, { total: 0, correct: 0 }));

  answers.forEach(ans => {
    const categoryId = ans.section_id || ans.content_snapshot?.category_id;
    if (!categoryId) return;

    // Standardize categoryId to canonical
    const canonicalKey = canonicalIds.find(c => categoryId.includes(c.split('-')[0] || '')) || categoryId;
    const existing = map.get(canonicalKey) || { total: 0, correct: 0 };

    existing.total += 1;
    if (ans.is_correct) {
      existing.correct += 1;
    }

    map.set(canonicalKey, existing);
  });

  return canonicalIds.map(id => {
    const data = map.get(id) || { total: 0, correct: 0 };
    const categoryName = CATEGORIES.find(c => c.id === id)?.name || id.replace('-', ' ').toUpperCase();
    const userAccuracy = data.total > 0 ? data.correct / data.total : 0;
    const passingTarget = 0.80; // INV-008 80% passing target
    const status = userAccuracy >= passingTarget ? 'passed' : 'needs_work';

    return {
      categoryId: id,
      categoryName,
      userAccuracy,
      passingTarget,
      status,
    };
  });
}
