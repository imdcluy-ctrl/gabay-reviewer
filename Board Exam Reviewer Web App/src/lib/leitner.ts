import { db } from './db';
import type { LocalAttempt, LocalReviewState } from './db';
import { analytics } from './analytics';
import { EVENTS } from './events';

export type LeitnerPace = 'Standard' | 'Accelerated' | 'Crunch';

export function currentPace(examDateStr?: string | null): LeitnerPace {
  if (!examDateStr) return 'Standard';
  const examDate = new Date(examDateStr);
  if (isNaN(examDate.getTime())) return 'Standard';

  const today = new Date();
  // Midnight comparison
  today.setHours(0, 0, 0, 0);
  const diffTime = examDate.getTime() - today.getTime();
  const daysToExam = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysToExam > 60) return 'Standard';
  if (daysToExam >= 31) return 'Accelerated';
  return 'Crunch'; // <= 30 days, exam day, or past date
}

// Returns interval in hours (§2.2)
export function boxIntervalFor(boxLevel: number, pace: LeitnerPace): number {
  const box = Math.max(1, Math.min(5, boxLevel));

  if (pace === 'Standard') {
    switch (box) {
      case 1: return 24;  // 1d
      case 2: return 72;  // 3d
      case 3: return 168; // 7d
      case 4: return 336; // 14d
      case 5: return 720; // 30d
    }
  } else if (pace === 'Accelerated') {
    switch (box) {
      case 1: return 24;  // 1d
      case 2: return 48;  // 2d
      case 3: return 120; // 5d
      case 4: return 240; // 10d
      case 5: return 504; // 21d
    }
  } else { // Crunch
    switch (box) {
      case 1: return 12;  // 12h
      case 2: return 24;  // 1d
      case 3: return 72;  // 3d
      case 4: return 120; // 5d
      case 5: return 168; // 7d
    }
  }

  return 24;
}

export function addHoursToISO(baseIsoStr: string, hours: number): string {
  const date = new Date(baseIsoStr);
  date.setTime(date.getTime() + hours * 60 * 60 * 1000);
  return date.toISOString();
}

export interface RateCardParams {
  localUserId: string;
  questionId: string;
  isCorrect: boolean;
  confidenceRating: number; // 1-3
  hintsUsedCount: number;
  sessionType: string; // 'practice' | 'review' | 'diagnostic'
  examDate?: string | null;
  nowIso?: string;
}

export async function rateLeitnerCard(params: RateCardParams): Promise<LocalReviewState | null> {
  // §2.5 Invariant #4: Diagnostic answers never write or update review_state
  if (params.sessionType === 'diagnostic') {
    return null;
  }

  const {
    localUserId,
    questionId,
    isCorrect,
    confidenceRating,
    hintsUsedCount,
    sessionType,
    examDate,
  } = params;

  const now = params.nowIso || new Date().toISOString();
  const pace = currentPace(examDate);
  const compositeId = `${localUserId}_${questionId}`;

  const existingState = await db.review_state.get(compositeId);

  let currentBox = existingState ? existingState.box_level : 1;
  let leechCount = existingState ? existingState.leech_count : 0;
  let isLeech = existingState ? existingState.is_leech : false;
  let shakyStreak = existingState ? existingState.shaky_correct_streak : 0;
  let consecutiveCorrect = existingState ? existingState.consecutive_correct : 0;

  let newBox = currentBox;
  let computedIntervalHours = 24;
  let newLastResult: 'correct' | 'incorrect' = isCorrect ? 'correct' : 'incorrect';

  if (!isCorrect) {
    // Incorrect outcome (§2.1)
    newBox = 1;
    shakyStreak = 0;
    consecutiveCorrect = 0;

    if (confidenceRating === 3) {
      // Overconfidence trap (😎 Sure)
      leechCount += 1;
      if (leechCount >= 3 && !isLeech) {
        isLeech = true;
        analytics.track(EVENTS.LEECH_THRESHOLD_HIT, {
          question_id: questionId,
          leech_count: leechCount,
        });
      }
    }

    computedIntervalHours = boxIntervalFor(1, pace);
  } else {
    // Correct outcome
    consecutiveCorrect += 1;

    if (isLeech && consecutiveCorrect >= 2) {
      // Leech recovery (§2.4)
      isLeech = false;
    }

    if (confidenceRating === 3) {
      // Correct + Sure (😎) -> Real Mastery promotion
      newBox = Math.min(5, currentBox + 1);
      shakyStreak = 0;
      computedIntervalHours = boxIntervalFor(newBox, pace);
    } else {
      // Correct + Unsure/Maybe (😟 or 🤔) -> Shaky Correct
      shakyStreak += 1;

      if (shakyStreak >= 2) {
        // Stagnation Tie-Breaker (§2.3)
        newBox = Math.min(5, currentBox + 1);
        shakyStreak = 0;
        computedIntervalHours = boxIntervalFor(newBox, pace);
      } else {
        // Normal Shaky Stay in Box: ~50% interval, floored at pace's Box 1 interval
        newBox = currentBox;
        const fullBoxInterval = boxIntervalFor(currentBox, pace);
        const box1Interval = boxIntervalFor(1, pace);
        computedIntervalHours = Math.max(box1Interval, Math.round(fullBoxInterval * 0.5));
      }
    }
  }

  // §2.5 Invariant #1: Always reschedule next_review_date strictly in the future (infinite loop guard)
  const nextReviewDateIso = addHoursToISO(now, computedIntervalHours);

  const updatedState: LocalReviewState = {
    id: compositeId,
    local_user_id: localUserId,
    question_id: questionId,
    box_level: newBox,
    next_review_date: nextReviewDateIso,
    last_result: newLastResult,
    leech_count: leechCount,
    is_leech: isLeech,
    shaky_correct_streak: shakyStreak,
    consecutive_correct: consecutiveCorrect,
    last_session_type: sessionType,
    updated_at: now,
  };

  await db.review_state.put(updatedState);

  // Emit CARD_RATED analytics event (§10)
  analytics.track(EVENTS.CARD_RATED, {
    box_level: currentBox,
    next_box: newBox,
    confidence: confidenceRating,
    correct: isCorrect,
    is_leech: isLeech,
    leech_count: leechCount,
    had_hint: hintsUsedCount > 0,
    session_type: sessionType,
  });

  return updatedState;
}

// §3.2 Idempotent Lazy Backfill Function
export async function backfillReviewState(localUserId: string): Promise<{ created: number; skipped: number }> {
  if (!localUserId) return { created: 0, skipped: 0 };

  const existingPks = await db.review_state
    .where('local_user_id')
    .equals(localUserId)
    .primaryKeys();

  const existingQids = new Set(existingPks.map(id => String(id).split('_').pop()));

  // Only non-diagnostic attempts
  const attempts = await db.attempts
    .where('local_user_id')
    .equals(localUserId)
    .filter(a => a.session_type !== 'diagnostic')
    .toArray();

  const latestByQuestion = new Map<string, LocalAttempt>();
  for (const a of attempts) {
    const cur = latestByQuestion.get(a.question_id);
    if (!cur || a.attempted_at > cur.attempted_at) {
      latestByQuestion.set(a.question_id, a);
    }
  }

  const profile = await db.user_profile.get(localUserId);
  const pace = currentPace(profile?.exam_date);

  const rowsToInsert: LocalReviewState[] = [];
  let skippedCount = 0;

  for (const [qid, attempt] of latestByQuestion) {
    if (existingQids.has(qid)) {
      skippedCount++;
      continue;
    }

    const isCorrectSure = attempt.is_correct && attempt.confidence_rating === 3;
    const initialBox = isCorrectSure ? 2 : 1;
    const intervalHours = boxIntervalFor(initialBox, pace);

    rowsToInsert.push({
      id: `${localUserId}_${qid}`,
      local_user_id: localUserId,
      question_id: qid,
      box_level: initialBox,
      next_review_date: addHoursToISO(attempt.attempted_at, intervalHours),
      last_result: attempt.is_correct ? 'correct' : 'incorrect',
      leech_count: !attempt.is_correct && attempt.confidence_rating === 3 ? 1 : 0,
      is_leech: false,
      shaky_correct_streak: attempt.is_correct && attempt.confidence_rating < 3 ? 1 : 0,
      consecutive_correct: attempt.is_correct ? 1 : 0,
      last_session_type: attempt.session_type,
      updated_at: attempt.attempted_at,
    });
  }

  if (rowsToInsert.length > 0) {
    await db.review_state.bulkPut(rowsToInsert);
  }

  analytics.track(EVENTS.BACKFILL_RUN, {
    created: rowsToInsert.length,
    skipped: skippedCount,
  });

  return { created: rowsToInsert.length, skipped: skippedCount };
}
