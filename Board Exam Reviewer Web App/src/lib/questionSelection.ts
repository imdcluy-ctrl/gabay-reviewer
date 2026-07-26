import { db } from './db';
import type { LocalQuestion, LocalReviewState } from './db';

export interface PrioritySelectionOptions {
  categoryId?: string;
  userId: string;
  sessionType: 'practice' | 'review';
  nowIso?: string;
}

export interface ReviewQueueSummary {
  trueDueCount: number;
  cappedSessionCount: number;
  masteredCount: number;
  boxCounts: Record<number, number>;
  estimatedMinutes: number;
  hasLeeches: boolean;
  isCapped: boolean;
}

import { getUserEntitlement, filterQuestionsForUser } from './entitlements';

// §4.1 Priority Ladder & §4.3 Daily Cap + Overflow Policy
export async function selectQuestionsForSession(
  options: PrioritySelectionOptions
): Promise<LocalQuestion[]> {
  const { categoryId, userId, sessionType } = options;
  const now = options.nowIso || new Date().toISOString();

  const entitlement = await getUserEntitlement(userId);
  const rawQuestions = await db.questions.toArray();
  const allQuestions = filterQuestionsForUser(rawQuestions, entitlement.is_premium);

  const categoryQuestions = categoryId && categoryId !== 'all'
    ? allQuestions.filter(q => q.category_id === categoryId)
    : allQuestions;

  if (categoryQuestions.length === 0) return [];

  // Get user's review states and attempts
  const userReviewStates = await db.review_state
    .where('local_user_id')
    .equals(userId)
    .toArray();

  const reviewStateMap = new Map<string, LocalReviewState>();
  userReviewStates.forEach(rs => reviewStateMap.set(rs.question_id, rs));

  const userAttempts = await db.attempts
    .where('local_user_id')
    .equals(userId)
    .filter(a => a.session_type !== 'diagnostic')
    .toArray();

  const attemptedQids = new Set(userAttempts.map(a => a.question_id));

  // If sessionType is 'review', draw ONLY due cards (next_review_date <= now)
  if (sessionType === 'review') {
    const dueCards: { question: LocalQuestion; state: LocalReviewState; overdueMs: number }[] = [];

    for (const q of categoryQuestions) {
      const rs = reviewStateMap.get(q.id);
      if (rs && rs.next_review_date <= now) {
        const overdueMs = new Date(now).getTime() - new Date(rs.next_review_date).getTime();
        dueCards.push({ question: q, state: rs, overdueMs });
      }
    }

    if (dueCards.length === 0) return [];

    // Order due cards:
    // 1. All due leeches first (is_leech === true)
    // 2. Lower box_level first (Box 1 -> Box 2 -> Box 3 -> Box 4 -> Box 5)
    // 3. Most-overdue first (overdueMs descending)
    const dueLeeches = dueCards.filter(c => c.state.is_leech);
    const nonLeeches = dueCards.filter(c => !c.state.is_leech);

    nonLeeches.sort((a, b) => {
      if (a.state.box_level !== b.state.box_level) {
        return a.state.box_level - b.state.box_level; // lower box first
      }
      return b.overdueMs - a.overdueMs; // most overdue first
    });

    // Cap at 20 non-leech cards, plus all due leeches (§4.3 INVARIANT)
    const selectedNonLeeches = nonLeeches.slice(0, 20);
    const selectedCards = [...dueLeeches, ...selectedNonLeeches];

    return selectedCards.map(c => c.question);
  }

  // If sessionType is 'practice' (§4.1 Priority Ladder, Uncapped):
  // 1. Overdue Leeches
  // 2. Overdue Box 1 & 2 cards
  // 3. Overdue Box 3-5 cards
  // 4. Unseen questions in category
  // 5. Weak-subtopic / attempted questions (oldest first)
  const leeches: LocalQuestion[] = [];
  const dueBox12: LocalQuestion[] = [];
  const dueBox345: LocalQuestion[] = [];
  const unseen: LocalQuestion[] = [];
  const attemptedOthers: LocalQuestion[] = [];

  for (const q of categoryQuestions) {
    const rs = reviewStateMap.get(q.id);
    const isAttempted = attemptedQids.has(q.id);

    if (rs && rs.next_review_date <= now) {
      if (rs.is_leech) {
        leeches.push(q);
      } else if (rs.box_level <= 2) {
        dueBox12.push(q);
      } else {
        dueBox345.push(q);
      }
    } else if (!isAttempted) {
      unseen.push(q);
    } else {
      attemptedOthers.push(q);
    }
  }

  // Sort attemptedOthers by oldest attempted first
  const latestAttemptMap = new Map<string, string>();
  userAttempts.forEach(a => {
    const cur = latestAttemptMap.get(a.question_id);
    if (!cur || a.attempted_at > cur) latestAttemptMap.set(a.question_id, a.attempted_at);
  });

  attemptedOthers.sort((a, b) => {
    const timeA = latestAttemptMap.get(a.id) || '';
    const timeB = latestAttemptMap.get(b.id) || '';
    return timeA.localeCompare(timeB);
  });

  return [...leeches, ...dueBox12, ...dueBox345, ...unseen, ...attemptedOthers];
}

// Single-question selector helper used by study session
export async function getNextQuestion(
  categoryId: string,
  userId: string,
  sessionType: 'practice' | 'review' = 'practice'
): Promise<LocalQuestion | null> {
  const list = await selectQuestionsForSession({
    categoryId,
    userId,
    sessionType,
  });
  return list.length > 0 ? (list[0] || null) : null;
}

// Summary statistics helper for /review UI (§5)
export async function getReviewQueueSummary(userId: string, nowIso?: string): Promise<ReviewQueueSummary> {
  const now = nowIso || new Date().toISOString();
  const allReviewStates = await db.review_state
    .where('local_user_id')
    .equals(userId)
    .toArray();

  let trueDueCount = 0;
  let masteredCount = 0;
  let hasLeeches = false;
  const boxCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  for (const rs of allReviewStates) {
    boxCounts[rs.box_level] = (boxCounts[rs.box_level] || 0) + 1;

    if (rs.box_level === 5) {
      masteredCount++;
    }

    if (rs.next_review_date <= now) {
      trueDueCount++;
      if (rs.is_leech) hasLeeches = true;
    }
  }

  const leechCount = allReviewStates.filter(rs => rs.is_leech && rs.next_review_date <= now).length;
  const nonLeechDueCount = trueDueCount - leechCount;
  const cappedNonLeechCount = Math.min(20, nonLeechDueCount);
  const cappedSessionCount = leechCount + cappedNonLeechCount;

  // Estimated review time: trueDueCount * 35s in minutes
  const estimatedMinutes = Math.ceil((trueDueCount * 35) / 60);

  return {
    trueDueCount,
    cappedSessionCount,
    masteredCount,
    boxCounts,
    estimatedMinutes,
    hasLeeches,
    isCapped: nonLeechDueCount > 20,
  };
}
