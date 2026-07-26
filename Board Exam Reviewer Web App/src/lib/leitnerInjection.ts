import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import type { MockExamAnswer, MockExamInjection } from '../types/mockExam';
import {
  CARELESS_THRESHOLD_SECONDS,
  CONCEPTUAL_THRESHOLD_SECONDS,
  leitnerConfig,
} from './config/leitner';

export type ExamErrorType = 'careless' | 'conceptual' | 'standard' | 'timeout';

export function classifyErrorType(answer: MockExamAnswer): ExamErrorType | 'correct' {
  if (!answer.chosen_option) return 'timeout';
  if (answer.chosen_option === answer.content_snapshot.correct_option) return 'correct';
  if (answer.time_spent_seconds < CARELESS_THRESHOLD_SECONDS) return 'careless';
  if (answer.time_spent_seconds > CONCEPTUAL_THRESHOLD_SECONDS) return 'conceptual';
  return 'standard';
}

export interface InjectionResult {
  injected: number;
  leeches_created: number;
  byType: Record<string, number>;
  alreadyInjected: boolean;
}

export async function injectMockExamResultsToLeitner(
  attemptId: string,
  userId: string
): Promise<InjectionResult> {
  const attempt = await db.mock_exam_attempts.get(attemptId);
  if (!attempt) {
    return { injected: 0, leeches_created: 0, byType: {}, alreadyInjected: false };
  }

  // Fast Replay Guard Check (INV-009)
  if (attempt.leitner_injected_at) {
    const existingInjections = await db.mock_exam_injections
      .where('attempt_id')
      .equals(attemptId)
      .toArray();

    const byTypeCounts: Record<string, number> = { careless: 0, conceptual: 0, standard: 0, timeout: 0 };
    existingInjections.forEach(inj => {
      byTypeCounts[inj.error_type] = (byTypeCounts[inj.error_type] || 0) + 1;
    });

    return {
      injected: existingInjections.length,
      leeches_created: 0,
      byType: byTypeCounts,
      alreadyInjected: true,
    };
  }

  const answers = await db.mock_exam_answers
    .where('attempt_id')
    .equals(attemptId)
    .toArray();

  let injectedCount = 0;
  let leechesCreated = 0;
  const byType: Record<string, number> = { careless: 0, conceptual: 0, standard: 0, timeout: 0 };

  // H2 Atomicity Transaction Wrapper: All review_state, injections, and attempt timestamp updates in one atomic block
  await db.transaction(
    'rw',
    [db.review_state, db.mock_exam_injections, db.mock_exam_attempts],
    async () => {
      for (const ans of answers) {
        // L2 Per-item ledger guard [attempt_id+question_id]
        const existingLedger = await db.mock_exam_injections
          .where('[attempt_id+question_id]')
          .equals([attemptId, ans.question_id])
          .first();

        if (existingLedger) continue;

        const classification = classifyErrorType(ans);

        // H1 / INV-010: Correct answers do NOT alter review_state by default
        if (classification === 'correct') {
          if (leitnerConfig.promote_correct_exam_answers) {
            // Optional promotion path if config enabled
            const reviewId = `${userId}_${ans.question_id}`;
            const existingSR = await db.review_state.get(reviewId);
            if (existingSR) {
              const nextBox = Math.min(5, existingSR.box_level + 1);
              await db.review_state.update(reviewId, {
                box_level: nextBox,
                updated_at: new Date().toISOString(),
              });
            }
          }
          continue; // Skip injection ledger entry for correct items
        }

        const errorType: ExamErrorType = classification;
        byType[errorType] = (byType[errorType] || 0) + 1;

        const reviewId = `${userId}_${ans.question_id}`;
        let existingSR = await db.review_state.get(reviewId);

        const currentBox = existingSR ? existingSR.box_level : 1;
        const currentLeechCount = existingSR ? existingSR.leech_count : 0;
        let nextBox = 1;
        let newLeechCount = currentLeechCount;
        let isLeech = existingSR ? existingSR.is_leech : false;

        // INV-010 Demotion & M1 Leech Rules:
        if (errorType === 'careless') {
          // Careless (<20s wrong): Box -1, NO leech increment (M1)
          nextBox = Math.max(1, currentBox - 1);
        } else if (errorType === 'conceptual') {
          // Conceptual (>120s wrong): Box 1 reset + leech +1 (M1)
          nextBox = 1;
          newLeechCount += 1;
        } else if (errorType === 'standard') {
          // Standard (20-120s wrong): min(existing, 2) (M2) + leech +1 (M1)
          nextBox = Math.min(currentBox, 2);
          newLeechCount += 1;
        } else if (errorType === 'timeout') {
          // Timeout (unanswered): max(existing - 1, 1), NO leech increment (M1)
          nextBox = Math.max(1, currentBox - 1);
        }

        if (newLeechCount >= 3) {
          isLeech = true;
          if (currentLeechCount < 3) leechesCreated++;
        }

        const nowIso = new Date().toISOString();
        const nextReviewDate = nowIso; // Due immediately for review

        if (!existingSR) {
          await db.review_state.add({
            id: reviewId,
            local_user_id: userId,
            question_id: ans.question_id,
            box_level: nextBox,
            next_review_date: nextReviewDate,
            last_result: 'incorrect',
            leech_count: newLeechCount,
            is_leech: isLeech,
            shaky_correct_streak: 0,
            consecutive_correct: 0,
            last_session_type: 'mock_exam',
            updated_at: nowIso,
          });
        } else {
          await db.review_state.update(reviewId, {
            box_level: nextBox,
            next_review_date: nextReviewDate,
            last_result: 'incorrect',
            leech_count: newLeechCount,
            is_leech: isLeech,
            last_session_type: 'mock_exam',
            updated_at: nowIso,
          });
        }

        // Write immutable ledger entry (INV-009)
        const injectionRecord: MockExamInjection = {
          id: uuidv4(),
          attempt_id: attemptId,
          question_id: ans.question_id,
          box_from: currentBox,
          box_to: nextBox,
          leech_count_before: currentLeechCount,
          leech_count_after: newLeechCount,
          error_type: errorType,
          injected_at: nowIso,
        };

        await db.mock_exam_injections.add(injectionRecord);
        injectedCount++;
      }

      // Mark attempt as injected
      await db.mock_exam_attempts.update(attemptId, {
        leitner_injected_at: new Date().toISOString(),
      });
    }
  );

  return {
    injected: injectedCount,
    leeches_created: leechesCreated,
    byType,
    alreadyInjected: false,
  };
}
