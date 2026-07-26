import { db } from './db';
import { selectMockExamQuestions, type SelectionConfig, type SelectionResult } from './mockExamSelection';

export interface CooldownStatus {
  allowed: boolean;
  attemptsLast7Days: number;
  warning?: string | undefined;
}

export interface RetakeOverlapResult {
  totalItems: number;
  seenItems: number;
  unseenItems: number;
  overlapPercentage: number;
  isHighOverlap: boolean; // true if overlapPercentage > 30% (INV-012)
  warningMessage?: string | undefined;
}

export interface RetakeSelectionOutcome {
  selection: SelectionResult;
  overlapResult: RetakeOverlapResult;
}

/**
  * M2 Soft Cooldown Check — checks attempt frequency in last 7 days.
  * Always returns allowed: true (warn-not-block philosophy).
  */
export async function canRetakeExam(userId: string, mockExamId: string): Promise<CooldownStatus> {
  const sevenDaysAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const recentAttempts = await db.mock_exam_attempts
    .where('[local_user_id+mock_exam_id+status]')
    .equals([userId, mockExamId, 'completed'])
    .filter(a => (a.completed_at || a.started_at) >= sevenDaysAgoIso)
    .toArray();

  const count = recentAttempts.length;
  let warning: string | undefined = undefined;

  if (count >= 3) {
    warning = `⚠️ You have taken this exam ${count} times this week. Spaced study between retakes yields better long-term retention.`;
  }

  return {
    allowed: true,
    attemptsLast7Days: count,
    warning,
  };
}

/**
  * H1 / M1 Retake Manager Orchestrator:
  * Collects question_ids from the LAST 2 ATTEMPTS ONLY (M1) and calls the canonical selection engine.
  */
export async function generateRetakeSelection(
  userId: string,
  mockExamId: string,
  isEntitled: boolean = true
): Promise<RetakeSelectionOutcome> {
  // Fetch last 2 attempts for user + mockExamId sorted by completed_at (M1, L5)
  const lastAttempts = await db.mock_exam_attempts
    .where('[local_user_id+mock_exam_id+status]')
    .equals([userId, mockExamId, 'completed'])
    .reverse()
    .sortBy('completed_at');

  const last2Attempts = lastAttempts.slice(0, 2);
  const recentQuestionIdsSet = new Set<string>();

  for (const att of last2Attempts) {
    const answers = await db.mock_exam_answers
      .where('attempt_id')
      .equals(att.id)
      .toArray();

    answers.forEach(a => recentQuestionIdsSet.add(a.question_id));
  }

  const recentQuestionIdsArray = Array.from(recentQuestionIdsSet);

  const targetExamId = mockExamId === 'full-simulation' ? 'cse-professional-v1' : mockExamId;

  // Fetch exam definition
  let examDef = await db.mock_exams.get(targetExamId);
  if (!examDef) {
    const { seedDefaultMockExams } = await import('./migrations/v3_mock_exams');
    await seedDefaultMockExams(db);
    examDef = await db.mock_exams.get(targetExamId);
  }

  if (!examDef) {
    throw new Error(`Mock Exam definition '${targetExamId}' not found.`);
  }

  const sections = JSON.parse(examDef.section_config);

  const config: SelectionConfig = {
    examId: targetExamId,
    examType: examDef.exam_type,
    sections,
    localUserId: userId,
    isEntitled,
    recentQuestionIds: recentQuestionIdsArray, // Last 2 attempts only (M1)
    allowOverlapFraction: 0.30, // INV-012 target <= 30%
  };

  // Call canonical selection engine with single config object (H1)
  const selection = await selectMockExamQuestions(config);

  let seenInRecentCount = 0;
  let total = 0;

  if (selection.ok) {
    total = selection.questions.length;
    selection.questions.forEach(q => {
      if (recentQuestionIdsSet.has(q.id)) {
        seenInRecentCount++;
      }
    });
  }

  const overlapPct = total > 0 ? Number(((seenInRecentCount / total) * 100).toFixed(1)) : 0;
  const isHigh = overlapPct > 30.0;

  const overlapResult: RetakeOverlapResult = {
    totalItems: total,
    seenItems: seenInRecentCount,
    unseenItems: total - seenInRecentCount,
    overlapPercentage: overlapPct,
    isHighOverlap: isHigh,
    warningMessage: isHigh
      ? `⚠️ High Overlap Warning (${overlapPct}% repeated items): Question pool exhausted for this tier.`
      : undefined,
  };

  return {
    selection,
    overlapResult,
  };
}
