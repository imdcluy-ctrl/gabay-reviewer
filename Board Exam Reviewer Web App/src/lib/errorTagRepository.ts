// Dexie Repository for Error Pattern Self-Tags (§3.1, INV-026)

import { db } from './db';
import {
  assertValidTag,
  clampNote,
  computeDistribution,
  type ErrorTagId,
  type ErrorTagRecord,
  type TagDistributionResult,
} from './errorTags';

export interface UpsertTagInput {
  localUserId: string;
  attemptId?: string | undefined;
  questionId: string;
  tag: ErrorTagId;
  note?: string | undefined;
  source?: 'mock_exam' | 'practice' | 'sr_review' | undefined;
  sourceSessionId?: string | undefined;
}

/**
 * Upserts a user error tag with deterministic uniqueness keys.
 * For mock_exam: [attempt_id+question_id]
 * For practice: [local_user_id+question_id]
 */
export async function upsertErrorTag(input: UpsertTagInput): Promise<ErrorTagRecord> {
  assertValidTag(input.tag);

  const source = input.source || (input.attemptId ? 'mock_exam' : 'practice');
  const attemptId = input.attemptId || '';
  const now = Date.now();
  const sanitizedNote = clampNote(input.note);

  let existing: ErrorTagRecord | undefined;

  if (source === 'mock_exam' && attemptId) {
    existing = await db.error_tags
      .where('[attempt_id+question_id]')
      .equals([attemptId, input.questionId])
      .first();
  } else {
    existing = await db.error_tags
      .where('[local_user_id+question_id]')
      .equals([input.localUserId, input.questionId])
      .first();
  }

  const record: ErrorTagRecord = {
    id: existing?.id,
    local_user_id: input.localUserId,
    attempt_id: attemptId,
    question_id: input.questionId,
    tag: input.tag,
    note: sanitizedNote,
    source,
    source_session_id: input.sourceSessionId,
    created_at: existing ? existing.created_at : now,
    updated_at: now,
  };

  const id = await db.error_tags.put(record);
  record.id = id;
  return record;
}

/**
 * Clears/deletes an error tag for a specific attempt & question.
 */
export async function clearErrorTag(attemptId: string, questionId: string): Promise<void> {
  const existing = await db.error_tags
    .where('[attempt_id+question_id]')
    .equals([attemptId, questionId])
    .first();

  if (existing && existing.id) {
    await db.error_tags.delete(existing.id);
  }
}

/**
 * Fetches tag for a specific mock attempt & question.
 */
export async function getErrorTagForMock(
  attemptId: string,
  questionId: string
): Promise<ErrorTagRecord | undefined> {
  return await db.error_tags
    .where('[attempt_id+question_id]')
    .equals([attemptId, questionId])
    .first();
}

/**
 * Lists all error tags associated with a mock attempt.
 */
export async function listErrorTagsForAttempt(attemptId: string): Promise<ErrorTagRecord[]> {
  return await db.error_tags.where('attempt_id').equals(attemptId).toArray();
}

/**
 * Computes INV-026f error tag distribution for a specific mock exam attempt.
 */
export async function getAttemptDistribution(attemptId: string): Promise<TagDistributionResult> {
  const answers = await db.mock_exam_answers
    .where('attempt_id')
    .equals(attemptId)
    .toArray();

  const incorrectAnswers = answers.filter(a => !a.is_correct);
  const incorrectCount = incorrectAnswers.length;

  const tagsRecords = await listErrorTagsForAttempt(attemptId);
  const tagIds = tagsRecords.map(r => r.tag);

  return computeDistribution(tagIds, incorrectCount);
}

/**
 * Computes global error tag distribution for a user across all attempts.
 */
export async function getGlobalDistribution(localUserId: string): Promise<TagDistributionResult> {
  const tagsRecords = await db.error_tags
    .where('local_user_id')
    .equals(localUserId)
    .toArray();

  const tagIds = tagsRecords.map(r => r.tag);

  // Total incorrect across user's mock answers
  const userAttempts = await db.mock_exam_attempts
    .where('local_user_id')
    .equals(localUserId)
    .toArray();

  let totalIncorrect = 0;
  for (const att of userAttempts) {
    const answers = await db.mock_exam_answers
      .where('attempt_id')
      .equals(att.id)
      .toArray();
    totalIncorrect += answers.filter(a => !a.is_correct).length;
  }

  return computeDistribution(tagIds, Math.max(totalIncorrect, tagsRecords.length));
}
