import { db } from './db';
import type { AnswerEvent, ReadinessInputs } from '../types/readiness';

/** Gather all answer events from study, mock, and short test sources. */
export async function collectReadinessData(localUserId: string): Promise<ReadinessInputs> {
  const [studyRaw, mockAnswers, mockAttempts] = await Promise.all([
    db.attempts.where('local_user_id').equals(localUserId).toArray(),
    db.mock_exam_answers.where('attempt_id').above('').toArray(),
    db.mock_exam_attempts.where('local_user_id').equals(localUserId).toArray(),
  ]);

  const attemptMap = new Map(mockAttempts.map(a => [a.id, a]));
  const mockAttemptIds = new Set(
    mockAttempts
      .filter(a => a.status === 'completed' && !a.mock_exam_id.includes('mini'))
      .map(a => a.id)
  );
  const shortTestAttemptIds = new Set(
    mockAttempts
      .filter(a => a.status === 'completed' && a.mock_exam_id.includes('mini'))
      .map(a => a.id)
  );

  // Build questionId -> categoryId map for study answers
  const allQuestions = await db.questions.toArray();
  const qCatMap = new Map(allQuestions.map(q => [q.id, q.category_id]));

  // Normalize study attempts
  const studyAttempts: AnswerEvent[] = studyRaw.map(a => ({
    questionId: a.question_id,
    categoryId: qCatMap.get(a.question_id) || 'general-information',
    isCorrect: a.is_correct,
    timestamp: a.attempted_at,
    source: 'study' as const,
    sourceWeight: 1,
  }));

  // Normalize mock + short test answers
  const mockAttemptsOut: AnswerEvent[] = [];
  const shortTestAttempts: AnswerEvent[] = [];

  for (const ans of mockAnswers) {
    if (ans.is_correct === null) continue;
    const attempt = attemptMap.get(ans.attempt_id);
    if (!attempt || attempt.status !== 'completed') continue;

    const catId = ans.section_id || qCatMap.get(ans.question_id) || 'general-information';
    const event: AnswerEvent = {
      questionId: ans.question_id,
      categoryId: catId,
      isCorrect: ans.is_correct,
      timestamp: ans.created_at,
      source: 'study', // placeholder
      sourceWeight: 1,
    };

    if (mockAttemptIds.has(ans.attempt_id)) {
      event.source = 'mock';
      event.sourceWeight = 3;
      mockAttemptsOut.push(event);
    } else if (shortTestAttemptIds.has(ans.attempt_id)) {
      event.source = 'short_test';
      event.sourceWeight = 2;
      shortTestAttempts.push(event);
    }
  }

  return { studyAttempts, mockAttempts: mockAttemptsOut, shortTestAttempts };
}

/** Quick check: has user completed any mock or short test? */
export async function hasAttemptedMock(localUserId: string): Promise<boolean> {
  const count = await db.mock_exam_attempts
    .where('local_user_id').equals(localUserId)
    .filter(a => a.status === 'completed')
    .count();
  return count > 0;
}
