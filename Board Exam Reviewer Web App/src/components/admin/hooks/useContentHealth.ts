import { useMemo } from 'react';
import { useUnifiedAnswers } from '../../../lib/deepAnalytics/hooks/useUnifiedAnswers';
import { CONTENT_HEALTH_CONFIG } from '../../../lib/deepAnalytics/config';
import type { UnifiedAnswer } from '../../../lib/deepAnalytics/types';

export interface QuestionHealthRecord {
  questionId: string;
  subjectArea: string;
  subtopic: string;
  attemptCount: number;
  correctCount: number;
  failRate: number; // 0.0 .. 1.0
  avgTimeSpentMs: number;
  flag: 'bad_question' | 'hard_topic' | 'none';
}

export function useContentHealth() {
  const { unifiedAnswers, orphanedCount, isLoading } = useUnifiedAnswers();

  const healthRecords = useMemo(() => {
    if (!unifiedAnswers || unifiedAnswers.length === 0) return [];

    const map = new Map<string, {
      questionId: string;
      subjectArea: string;
      subtopic: string;
      attempts: UnifiedAnswer[];
    }>();

    unifiedAnswers.forEach(ans => {
      const existing = map.get(ans.questionId) || {
        questionId: ans.questionId,
        subjectArea: ans.subjectArea,
        subtopic: ans.subtopic,
        attempts: [],
      };
      existing.attempts.push(ans);
      map.set(ans.questionId, existing);
    });

    const records: QuestionHealthRecord[] = [];

    map.forEach(item => {
      const attemptCount = item.attempts.length;
      const correctCount = item.attempts.filter(a => a.isCorrect).length;
      const failRate = attemptCount > 0 ? (attemptCount - correctCount) / attemptCount : 0;
      const totalTime = item.attempts.reduce((acc, a) => acc + (a.timeSpentMs || 0), 0);
      const avgTimeSpentMs = attemptCount > 0 ? totalTime / attemptCount : 0;

      let flag: 'bad_question' | 'hard_topic' | 'none' = 'none';

      if (
        failRate >= CONTENT_HEALTH_CONFIG.BAD_QUESTION_FAIL_RATE &&
        attemptCount >= CONTENT_HEALTH_CONFIG.BAD_QUESTION_MIN_ATTEMPTS
      ) {
        flag = 'bad_question';
      } else if (
        failRate >= CONTENT_HEALTH_CONFIG.HARD_TOPIC_FAIL_RATE &&
        attemptCount >= CONTENT_HEALTH_CONFIG.HARD_TOPIC_MIN_ATTEMPTS
      ) {
        flag = 'hard_topic';
      }

      records.push({
        questionId: item.questionId,
        subjectArea: item.subjectArea,
        subtopic: item.subtopic,
        attemptCount,
        correctCount,
        failRate,
        avgTimeSpentMs,
        flag,
      });
    });

    return records.sort((a, b) => b.failRate - a.failRate || b.attemptCount - a.attemptCount);
  }, [unifiedAnswers]);

  const flaggedRecords = useMemo(() => {
    return healthRecords.filter(r => r.flag !== 'none');
  }, [healthRecords]);

  return {
    healthRecords,
    flaggedRecords,
    totalUnifiedAttempts: unifiedAnswers.length,
    orphanedCount,
    isLoading,
  };
}
