import { db } from './db';
import type { LocalQuestion } from './db';
import type { MockExamSection } from '../types/mockExam';

export interface SelectionConfig {
  examId: string;
  examType: 'professional' | 'subprofessional';
  sections: MockExamSection[];
  localUserId: string;
  isEntitled: boolean;
  recentQuestionIds: string[]; // Question IDs from last 2 attempts (INV-012)
  allowOverlapFraction?: number; // Target max overlap fraction (default 0.30)
}

export type SelectionResult =
  | { ok: true; questions: LocalQuestion[]; warnings: string[] }
  | { ok: false; reason: 'pool_too_small'; section_id: string; needed: number; available: number }
  | { ok: false; reason: 'entitlement'; message: string };

export async function selectMockExamQuestions(
  config: SelectionConfig
): Promise<SelectionResult> {
  const {
    sections,
    localUserId,
    isEntitled,
    recentQuestionIds,
    allowOverlapFraction = 0.30,
  } = config;

  const warnings: string[] = [];
  const selectedQuestions: LocalQuestion[] = [];
  const selectedQids = new Set<string>();

  // Fetch user's previous attempt question IDs
  const userAttempts = await db.attempts
    .where('local_user_id')
    .equals(localUserId)
    .toArray();
  const attemptedQids = new Set(userAttempts.map(a => a.question_id));

  // Entitlement gate check (INV-017)
  const allQuestions = await db.questions.toArray();
  const eligibleQuestions = isEntitled
    ? allQuestions
    : allQuestions.filter(q => q.is_free);

  if (!isEntitled && eligibleQuestions.length < 5) {
    return {
      ok: false,
      reason: 'entitlement',
      message: 'Full mock exam simulation requires an active subscription or unlocked account.',
    };
  }

  const recentSet = new Set(recentQuestionIds);

  for (const section of sections) {
    const sectionCategories = new Set(section.category_ids);
    const pool = eligibleQuestions.filter(q => 
      sectionCategories.has(q.category_id) || 
      (!!q.subtopic_id && sectionCategories.has(q.subtopic_id)) ||
      (section.section_id === 'general' && (q.category_id.includes('general') || q.category_id === 'general-information'))
    );

    if (pool.length === 0) {
      return {
        ok: false,
        reason: 'pool_too_small',
        section_id: section.section_id,
        needed: section.question_count,
        available: 0,
      };
    }

    const targetCount = Math.min(section.question_count, pool.length);
    if (pool.length < section.question_count) {
      warnings.push(`Section '${section.name}' pool (${pool.length}) below target (${section.question_count}). Drawing all available items.`);
    }

    // Categorize pool questions for priority selection
    const unseen: LocalQuestion[] = [];
    const nonRecent: LocalQuestion[] = [];
    const others: LocalQuestion[] = [];

    for (const q of pool) {
      if (selectedQids.has(q.id)) continue; // INV-003: no duplicates within attempt

      if (!attemptedQids.has(q.id)) {
        unseen.push(q);
      } else if (!recentSet.has(q.id)) {
        nonRecent.push(q);
      } else {
        others.push(q);
      }
    }

    // Shuffle arrays to ensure fresh variation
    const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

    const prioritized = [
      ...shuffle(unseen),
      ...shuffle(nonRecent),
      ...shuffle(others),
    ];

    const chosenForSection = prioritized.slice(0, targetCount);

    for (const q of chosenForSection) {
      selectedQuestions.push(q);
      selectedQids.add(q.id);
    }
  }

  // Calculate actual overlap with recentQuestionIds (M3)
  if (recentQuestionIds.length > 0) {
    const overlapCount = selectedQuestions.filter(q => recentSet.has(q.id)).length;
    const overlapRatio = overlapCount / selectedQuestions.length;

    if (overlapRatio > allowOverlapFraction) {
      warnings.push(
        `Retake question overlap is ${(overlapRatio * 100).toFixed(
          1
        )}% due to limited question pool size (target is ≤${(allowOverlapFraction * 100).toFixed(0)}%).`
      );
    }
  }

  return {
    ok: true,
    questions: selectedQuestions,
    warnings,
  };
}
