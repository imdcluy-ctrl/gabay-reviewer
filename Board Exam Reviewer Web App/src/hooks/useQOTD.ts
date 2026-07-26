import { useState, useCallback, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { useUserProfile } from './useUserProfile';
import { useStreak } from './useStreak';
import { useEntitlement } from '../hooks/useEntitlement';
import { filterQuestionsForUser } from '../lib/entitlements';
import { CATEGORIES } from '../lib/constants';

const QOTD_LAST_KEY = 'gabay_qotd_last';
const QOTD_STREAK_KEY = 'gabay_qotd_streak';
const QOTD_IDS_KEY = 'gabay_qotd_ids_used';

interface QOTDState {
  /** ISO date string of the day (YYYY-MM-DD) */
  today: string;
  /** Whether the user has answered QOTD today */
  answeredToday: boolean;
  /** Current QOTD streak count */
  streak: number;
  /** The selected QOTD question, or null if already answered / no questions available */
  question: import('../lib/db').LocalQuestion | null;
  /** Category name for display */
  categoryName: string;
  /** Loading state */
  loading: boolean;
}

function getTodayStr(): string {
  return new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
}

function readStreak(): number {
  try {
    return Number(localStorage.getItem(QOTD_STREAK_KEY)) || 0;
  } catch {
    return 0;
  }
}

function readLastDate(): string | null {
  try {
    return localStorage.getItem(QOTD_LAST_KEY);
  } catch {
    return null;
  }
}

function readUsedIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(QOTD_IDS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUsedIds(ids: string[]) {
  localStorage.setItem(QOTD_IDS_KEY, JSON.stringify(ids));
}

function saveStreak(streak: number) {
  localStorage.setItem(QOTD_STREAK_KEY, String(streak));
}

function saveLastDate(date: string) {
  localStorage.setItem(QOTD_LAST_KEY, date);
}

export function useQOTD(): QOTDState & { markAnswered: () => void } {
  const { profile } = useUserProfile();
  useStreak(); // Keep streak computation active
  const { isPremium } = useEntitlement();

  const today = getTodayStr();
  const lastDate = readLastDate();
  const [answeredToday, setAnsweredToday] = useState(lastDate === today);
  const [qotdStreak, setQotdStreak] = useState(() => {
    const last = readLastDate();
    const stored = readStreak();
    // Reset streak if last QOTD was more than 1 day ago
    if (last) {
      const lastDateObj = new Date(last + 'T00:00:00');
      const todayObj = new Date(today + 'T00:00:00');
      const diffDays = Math.floor((todayObj.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 1) return 0;
    }
    return stored;
  });

  const rawQuestions = useLiveQuery(() => db.questions.toArray()) || [];
  const questions = filterQuestionsForUser(rawQuestions, isPremium);

  // Get attempts to determine weakest category
  const attempts = useLiveQuery(
    () => (profile ? db.attempts.where('local_user_id').equals(profile.id).toArray() : []),
    [profile?.id]
  );

  const [question, setQuestion] = useState<import('../lib/db').LocalQuestion | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);

  const safeQuestions = questions || [];

  // Compute weakest category
  const getWeakestCategory = useCallback((): string => {
    const qs = safeQuestions;
    if (!attempts || attempts.length === 0) {
      // Default to numerical-ability for new users
      return 'numerical-ability';
    }

    const accuracies: Record<string, { correct: number; total: number }> = {};
    attempts.forEach(a => {
      if (!accuracies[a.question_id]) {
        accuracies[a.question_id] = { correct: 0, total: 0 };
      }
      accuracies[a.question_id]!.total++;
      if (a.is_correct) accuracies[a.question_id]!.correct++;
    });

    // Aggregate by category
    const catAccuracies: Record<string, { correct: number; total: number }> = {};
    qs.forEach(q => {
      const stats = accuracies[q.id];
      if (stats) {
        if (!catAccuracies[q.category_id]) {
          catAccuracies[q.category_id] = { correct: 0, total: 0 };
        }
        catAccuracies[q.category_id]!.correct += stats.correct;
        catAccuracies[q.category_id]!.total += stats.total;
      }
    });

    // Find category with lowest accuracy
    let worstCat = 'numerical-ability';
    let worstRate = 1;
    for (const [catId, stats] of Object.entries(catAccuracies)) {
      if (stats && stats.total > 0) {
        const rate = stats.correct / stats.total;
        if (rate < worstRate) {
          worstRate = rate;
          worstCat = catId;
        }
      }
    }

    return worstCat;
  }, [attempts, safeQuestions]);

  // Select QOTD question
  useEffect(() => {
    if (answeredToday || safeQuestions.length === 0) {
      setLoading(false);
      return;
    }

    const worstCat = getWeakestCategory();
    const usedIds = readUsedIds();

    // Find questions from weakest category that haven't been used
    let candidates = safeQuestions.filter(
      q => q.category_id === worstCat && !usedIds.includes(q.id)
    );

    // Fallback: if all questions in weakest category used, pick any unused
    if (candidates.length === 0) {
      candidates = safeQuestions.filter(q => !usedIds.includes(q.id));
    }

    // Fallback: if all questions have been used, start fresh with empty usedIds
    if (candidates.length === 0) {
      candidates = safeQuestions.filter(q => q.category_id === worstCat);
      saveUsedIds([]);
    }

    // Pick one at random
    const pick = candidates[Math.floor(Math.random() * candidates.length)];

    if (pick) {
      setQuestion(pick);
      const cat = CATEGORIES.find(c => c.id === pick.category_id);
      setCategoryName(cat?.name || pick.category_id);
    }

    setLoading(false);
  }, [answeredToday, questions, getWeakestCategory]);

  const markAnswered = useCallback(() => {
    const todayStr = getTodayStr();
    const last = readLastDate();
    const storedStreak = readStreak();

    // Calculate new streak
    let newStreak = 1;
    if (last) {
      const lastDateObj = new Date(last + 'T00:00:00');
      const todayObj = new Date(todayStr + 'T00:00:00');
      const diffDays = Math.floor((todayObj.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        newStreak = storedStreak + 1; // Consecutive day
      } else if (diffDays === 0) {
        newStreak = storedStreak; // Already answered today
      }
      // else diffDays > 1: streak resets to 1
    }

    // Save QOTD question ID to used list
    if (question) {
      const usedIds = readUsedIds();
      if (!usedIds.includes(question.id)) {
        usedIds.push(question.id);
        saveUsedIds(usedIds);
      }
    }

    saveLastDate(todayStr);
    saveStreak(newStreak);
    setQotdStreak(newStreak);
    setAnsweredToday(true);
  }, [question]);

  return {
    today,
    answeredToday,
    streak: qotdStreak,
    question,
    categoryName,
    loading,
    markAnswered,
  };
}
