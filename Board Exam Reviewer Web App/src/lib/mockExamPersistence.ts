import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import type { LocalQuestion } from './db';
import type {
  MockExamAttempt,
  MockExamAnswer,
  MockExamPause,
  AnswerContentSnapshot,
} from '../types/mockExam';
import { enqueueCoalescedSync } from './examSync';

export class MockExamPersistence {
  // INV-016: Load at most 1 active non-terminal attempt per (user, exam). Supersedes older duplicates.
  static async loadResumableAttempt(userId: string, examId: string): Promise<MockExamAttempt | null> {
    const activeAttempts = await db.mock_exam_attempts
      .where('[local_user_id+mock_exam_id+status]')
      .anyOf([
        [userId, examId, 'in_progress'],
        [userId, examId, 'paused'],
      ])
      .toArray();

    if (activeAttempts.length === 0) return null;

    if (activeAttempts.length === 1) {
      return activeAttempts[0] || null;
    }

    // Multi-device race resolution (L4): pick latest started_at and supersede older rows
    activeAttempts.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
    const latest = activeAttempts[0];
    if (!latest) return null;

    for (let i = 1; i < activeAttempts.length; i++) {
      const stale = activeAttempts[i];
      if (!stale) continue;
      await db.mock_exam_attempts.update(stale.id, {
        status: 'abandoned',
      });
    }

    return latest;
  }

  // INV-016b: Abandon in-progress attempts that were assembled from a stale/truncated
  // question bank (e.g. a 5-question exam created while the on-device bank was tiny).
  // Because createAttempt writes ALL answer rows up front, an attempt whose answer-row
  // count is far below the exam target is unambiguous evidence of a stale attempt that
  // would otherwise lock the user into a truncated exam forever.
  static async abandonTruncatedAttempts(
    userId: string,
    examId: string,
    minimumQuestionCount: number
  ): Promise<void> {
    const activeAttempts = await db.mock_exam_attempts
      .where('[local_user_id+mock_exam_id+status]')
      .anyOf([
        [userId, examId, 'in_progress'],
        [userId, examId, 'paused'],
      ])
      .toArray();

    for (const attempt of activeAttempts) {
      const answerCount = await db.mock_exam_answers
        .where('attempt_id')
        .equals(attempt.id)
        .count();

      if (answerCount < minimumQuestionCount) {
        await db.mock_exam_attempts.update(attempt.id, { status: 'abandoned' });
        console.warn(
          `[Gabay] Abandoned truncated mock exam attempt ${attempt.id} (${answerCount} rows < ${minimumQuestionCount} expected).`
        );
      }
    }
  }

  // Create attempt with full content_snapshot per question (INV-016, INV-019, M6)
  // `forceNew` lets "Start Fresh Attempt" (and retakes) truly supersede an existing
  // non-terminal attempt instead of silently resuming the stale one.
  static async createAttempt(
    userId: string,
    examId: string,
    mode: 'practice' | 'simulation',
    selectedQuestions: LocalQuestion[],
    forceNew: boolean = false
  ): Promise<MockExamAttempt> {
    if (!forceNew) {
      const existing = await this.loadResumableAttempt(userId, examId);
      if (existing) {
        return existing; // INV-016: Return existing attempt if non-terminal exists
      }
    } else {
      // Supersede any existing active attempt for this exam (INV-016 single-active guard)
      const existingActive = await this.loadResumableAttempt(userId, examId);
      if (existingActive) {
        await db.mock_exam_attempts.update(existingActive.id, { status: 'abandoned' });
        console.log(`[Gabay] Superseded previous in-progress attempt ${existingActive.id} with a fresh attempt.`);
      }
    }

    const exam = await db.mock_exams.get(examId);
    const durationMinutes = exam ? exam.time_limit_minutes : 190;
    const nowIso = new Date().toISOString();
    const attemptId = uuidv4();

    const newAttempt: MockExamAttempt = {
      id: attemptId,
      local_user_id: userId,
      mock_exam_id: examId,
      started_at: nowIso,
      completed_at: null,
      score: null,
      percentage: null,
      passed: null,
      status: 'in_progress',
      mode,
      integrity_flag: 'none',
      time_remaining_seconds: durationMinutes * 60,
      paused_accumulated_ms: 0,
      current_question_index: 0,
      section_times: JSON.stringify({}),
      leitner_injected_at: null,
    };

    const answerRows: MockExamAnswer[] = selectedQuestions.map((q, idx) => {
      const snapshot: AnswerContentSnapshot = {
        question_text: q.question_text,
        options: {
          A: q.options.find(o => o.key === 'A')?.text || '',
          B: q.options.find(o => o.key === 'B')?.text || '',
          C: q.options.find(o => o.key === 'C')?.text || '',
          D: q.options.find(o => o.key === 'D')?.text || '',
        },
        correct_option: q.correct_option as 'A' | 'B' | 'C' | 'D',
        explanation: q.deconstruct_text,
        hint_ladder: q.hint_ladder.map(h => `${h.title}: ${h.text}`),
        deconstruction: q.deconstruct_text,
        trap_type: q.choice_explanations?.[q.correct_option]?.trap_type || null,
        subtopic: q.subtopic || q.subtopic_id || 'General',
        category_id: q.category_id,
        content_version: q.version || 1,
      };

      return {
        id: uuidv4(),
        attempt_id: attemptId,
        question_id: q.id,
        question_index: idx,
        chosen_option: null,
        is_correct: null,
        time_spent_seconds: 0,
        flagged: false,
        section_id: q.category_id,
        content_snapshot: snapshot,
        created_at: nowIso,
      };
    });

    await db.transaction('rw', [db.mock_exam_attempts, db.mock_exam_answers], async () => {
      await db.mock_exam_attempts.add(newAttempt);
      await db.mock_exam_answers.bulkAdd(answerRows);
    });

    await enqueueCoalescedSync(attemptId, 'state', newAttempt);
    return newAttempt;
  }

  // Fast local answer save ≤5s (INV-005)
  static async saveAnswer(attemptId: string, answer: Partial<MockExamAnswer> & { question_id: string }): Promise<void> {
    const existing = await db.mock_exam_answers
      .where('attempt_id')
      .equals(attemptId)
      .filter(a => a.question_id === answer.question_id)
      .first();

    if (existing) {
      await db.mock_exam_answers.update(existing.id, answer);
    }
    await enqueueCoalescedSync(attemptId, 'answer', answer);
  }

  // Save timer state local write
  static async saveTimerState(attemptId: string, partial: Partial<MockExamAttempt>): Promise<void> {
    await db.mock_exam_attempts.update(attemptId, partial);
    await enqueueCoalescedSync(attemptId, 'state', partial);
  }

  // Record pause (M2)
  static async recordPause(attemptId: string): Promise<string> {
    const pauseId = uuidv4();
    const nowIso = new Date().toISOString();
    const pauseRecord: MockExamPause = {
      id: pauseId,
      attempt_id: attemptId,
      paused_at: nowIso,
      resumed_at: null,
      duration_seconds: null,
    };
    await db.mock_exam_pauses.add(pauseRecord);
    await db.mock_exam_attempts.update(attemptId, { status: 'paused' });
    await enqueueCoalescedSync(attemptId, 'pause', pauseRecord);
    return pauseId;
  }

  // Record resume (M2)
  static async recordResume(attemptId: string, pauseId: string, durationSeconds: number): Promise<void> {
    const nowIso = new Date().toISOString();
    await db.mock_exam_pauses.update(pauseId, {
      resumed_at: nowIso,
      duration_seconds: durationSeconds,
    });
    await db.mock_exam_attempts.update(attemptId, { status: 'in_progress' });
    await enqueueCoalescedSync(attemptId, 'state', { status: 'in_progress' });
  }

  // Finalize attempt (M6)
  static async finalizeAttempt(
    attemptId: string,
    results: { score: number; percentage: number; passed: boolean },
    status: 'completed' | 'auto_submitted'
  ): Promise<void> {
    const nowIso = new Date().toISOString();
    const updatePayload = {
      score: results.score,
      percentage: results.percentage,
      passed: results.passed,
      completed_at: nowIso,
      status,
    };

    await db.mock_exam_attempts.update(attemptId, updatePayload);
    await enqueueCoalescedSync(attemptId, 'final', updatePayload);
  }
}
