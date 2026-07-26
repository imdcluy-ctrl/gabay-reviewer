import type { MockExamAnswer } from '../../types/mockExam';
import type { LocalAttempt, LocalQuestion } from '../db';
import type { UnifiedAnswer, MapResult } from './types';

export const normalizeAnswer = (answerStr: string | null | undefined): string => {
  if (!answerStr) return '';
  return answerStr.trim().toUpperCase();
};

export function mapMockExamAnswers(
  answers: MockExamAnswer[],
  questionsMap: Map<string, LocalQuestion>
): MapResult {
  const unifiedAnswers: UnifiedAnswer[] = [];
  let orphanedCount = 0;

  for (const ans of answers) {
    const q = questionsMap.get(ans.question_id);
    const snap = ans.content_snapshot;

    const subjectArea = snap?.category_id || q?.category_id;
    const subtopic = snap?.subtopic || q?.subtopic;
    const correctAnswer = snap?.correct_option || q?.correct_option;

    if (!subjectArea || !subtopic || !correctAnswer || !ans.chosen_option) {
      orphanedCount++;
      continue;
    }

    const normSelected = normalizeAnswer(ans.chosen_option);
    const normCorrect = normalizeAnswer(correctAnswer);

    unifiedAnswers.push({
      questionId: ans.question_id,
      subjectArea,
      subtopic,
      selectedAnswer: ans.chosen_option,
      correctAnswer,
      isCorrect: normSelected === normCorrect,
      answeredAt: ans.created_at || new Date().toISOString(),
      source: 'mock_exam',
      timeSpentMs: (ans.time_spent_seconds || 0) * 1000,
      examId: ans.attempt_id,
    });
  }

  return { unifiedAnswers, orphanedCount };
}

export function mapPracticeAttempts(
  attempts: LocalAttempt[],
  questionsMap: Map<string, LocalQuestion>
): MapResult {
  const unifiedAnswers: UnifiedAnswer[] = [];
  let orphanedCount = 0;

  for (const att of attempts) {
    const q = questionsMap.get(att.question_id);
    if (!q) {
      orphanedCount++;
      continue;
    }

    const normSelected = normalizeAnswer(att.chosen_option);
    const normCorrect = normalizeAnswer(q.correct_option);

    unifiedAnswers.push({
      questionId: att.question_id,
      subjectArea: q.category_id,
      subtopic: q.subtopic,
      selectedAnswer: att.chosen_option,
      correctAnswer: q.correct_option,
      isCorrect: normSelected === normCorrect,
      answeredAt: att.attempted_at || new Date().toISOString(),
      source: att.session_type === 'review' ? 'spaced_repetition' : 'practice',
      timeSpentMs: (att.time_spent_seconds || 0) * 1000,
      sessionId: att.id,
    });
  }

  return { unifiedAnswers, orphanedCount };
}
