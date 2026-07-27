import { db, type LocalQuestion } from './db';
import type { StreakQuestion, BlendSource, StreakBlend } from '../types/game';
import type { MockExamAttempt } from '../types/mockExam';

/** Select a single question for the streak game using the configured blend.
 *  Falls back through tiers: blend source -> any unused -> any question. */
export async function selectStreakQuestion(
  localUserId: string,
  isPremium: boolean,
  usedToday: Set<string>,
  blend: StreakBlend
): Promise<StreakQuestion | null> {
  const allQ = await db.questions.toArray();
  const eligible = isPremium ? allQ : allQ.filter(q => q.is_free);
  const unused = eligible.filter(q => !usedToday.has(q.id));

  if (unused.length === 0) {
    // All questions exhausted today ? restart with full pool
    usedToday.clear();
    const fallback = eligible[Math.floor(Math.random() * eligible.length)];
    return fallback ? { questionId: fallback.id, categoryId: fallback.category_id, blendSource: 'unseen' } : null;
  }

  // Determine blend source via weighted random
  const roll = Math.random();
  let source: BlendSource;
  if (roll < blend.unseenFraction) {
    source = 'unseen';
  } else if (roll < blend.unseenFraction + blend.weakCategoryFraction) {
    source = 'weak_category';
  } else {
    source = 'spaced_review';
  }

  // Get weak category from user history
  const weakCat = await getWeakestCategory(localUserId);

  switch (source) {
    case 'unseen': {
      // Questions the user has never attempted
      const attempts = await db.attempts
        .where('local_user_id').equals(localUserId).toArray();
      const attemptedIds = new Set(attempts.map(a => a.question_id));
      const unseenPool = unused.filter(q => !attemptedIds.has(q.id));
      if (unseenPool.length > 0) {
        const pick = unseenPool[Math.floor(Math.random() * unseenPool.length)];
        return { questionId: pick.id, categoryId: pick.category_id, blendSource: 'unseen' };
      }
      // fall through to random
      break;
    }
    case 'weak_category': {
      if (weakCat) {
        const weakPool = unused.filter(q => q.category_id === weakCat);
        if (weakPool.length > 0) {
          const pick = weakPool[Math.floor(Math.random() * weakPool.length)];
          return { questionId: pick.id, categoryId: pick.category_id, blendSource: 'weak_category' };
        }
      }
      break;
    }
    case 'spaced_review': {
      // Questions the user got wrong previously
      const wrongAttempts = await db.attempts
        .where('local_user_id').equals(localUserId)
        .filter(a => !a.is_correct)
        .toArray();
      const wrongIds = wrongAttempts.map(a => a.question_id);
      const reviewPool = unused.filter(q => wrongIds.includes(q.id));
      if (reviewPool.length > 0) {
        const pick = reviewPool[Math.floor(Math.random() * reviewPool.length)];
        return { questionId: pick.id, categoryId: pick.category_id, blendSource: 'spaced_review' };
      }
      break;
    }
  }

  // Fallback: any unused question
  const randomPick = unused[Math.floor(Math.random() * unused.length)];
  return randomPick
    ? { questionId: randomPick.id, categoryId: randomPick.category_id, blendSource: 'unseen' }
    : null;
}

/** Determine the user's weakest category by accuracy. */
async function getWeakestCategory(localUserId: string): Promise<string | null> {
  const attempts = await db.attempts
    .where('local_user_id').equals(localUserId).toArray();

  if (attempts.length === 0) return null;

  const catMap = new Map<string, { correct: number; total: number }>();
  for (const a of attempts) {
    if (!catMap.has(a.question_id)) {
      const q = await db.questions.get(a.question_id);
      if (!q) continue;
      catMap.set(a.question_id, { correct: 0, total: 0 });
    }
    const entry = catMap.get(a.question_id)!;
    entry.total++;
    if (a.is_correct) entry.correct++;
  }

  // Aggregate by category
  const catAgg = new Map<string, { correct: number; total: number }>();
  for (const [qid, stats] of catMap) {
    const q = await db.questions.get(qid);
    if (!q) continue;
    if (!catAgg.has(q.category_id)) {
      catAgg.set(q.category_id, { correct: 0, total: 0 });
    }
    const agg = catAgg.get(q.category_id)!;
    agg.correct += stats.correct;
    agg.total += stats.total;
  }

  // Find lowest accuracy category with at least 5 answered
  let worstCat: string | null = null;
  let worstAcc = 1;
  for (const [cat, stats] of catAgg) {
    if (stats.total < 5) continue;
    const acc = stats.correct / stats.total;
    if (acc < worstAcc) {
      worstAcc = acc;
      worstCat = cat;
    }
  }

  return worstCat;
}

/** Load today's used question IDs from localStorage. */
export function loadUsedToday(): Set<string> {
  try {
    const raw = localStorage.getItem('gabay_streak_used_today');
    const today = new Date().toLocaleDateString('en-CA');
    const data = JSON.parse(raw || '{}');
    return data.date === today ? new Set<string>(data.ids || []) : new Set<string>();
  } catch {
    return new Set<string>();
  }
}

/** Save today's used question IDs to localStorage. */
export function saveUsedToday(ids: Set<string>): void {
  const today = new Date().toLocaleDateString('en-CA');
  localStorage.setItem('gabay_streak_used_today', JSON.stringify({ date: today, ids: [...ids] }));
}
