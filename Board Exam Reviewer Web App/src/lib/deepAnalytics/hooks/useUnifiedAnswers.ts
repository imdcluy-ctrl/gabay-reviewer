import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { mapMockExamAnswers, mapPracticeAttempts } from '../mappers';
import type { UnifiedAnswer } from '../types';

export interface UseUnifiedAnswersResult {
  unifiedAnswers: UnifiedAnswer[];
  orphanedCount: number;
  isLoading: boolean;
}

/**
 * Shared hook acting as single source of truth for UnifiedAnswer pipeline.
 * Hydrates questions, mock answers, and practice attempts in one compound pass.
 */
export function useUnifiedAnswers(): UseUnifiedAnswersResult {
  const result = useLiveQuery(
    async () => {
      const [questions, mockAnswers, practiceAttempts] = await Promise.all([
        db.questions.toArray(),
        db.mock_exam_answers.toArray(),
        db.attempts.toArray(),
      ]);

      const qMap = new Map(questions.map(q => [q.id, q]));
      const mockRes = mapMockExamAnswers(mockAnswers, qMap);
      const practiceRes = mapPracticeAttempts(practiceAttempts, qMap);

      const unifiedAnswers = [...mockRes.unifiedAnswers, ...practiceRes.unifiedAnswers];
      const totalOrphaned = mockRes.orphanedCount + practiceRes.orphanedCount;

      return {
        unifiedAnswers,
        orphanedCount: totalOrphaned,
        isLoading: false,
      };
    },
    [],
    { unifiedAnswers: [], orphanedCount: 0, isLoading: true }
  );

  const isLoading = !result || result.isLoading;

  return {
    unifiedAnswers: result?.unifiedAnswers || [],
    orphanedCount: result?.orphanedCount || 0,
    isLoading,
  };
}
