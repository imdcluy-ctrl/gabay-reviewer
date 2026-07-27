import { useState, useCallback, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { useUserProfile } from './useUserProfile';
import { useStreak } from './useStreak';
import { ACHIEVEMENTS, checkAchievements, type Achievement, type AchievementStats } from '../lib/achievements';

const UNLOCKED_KEY = 'gabay_achievements';

function readUnlocked(): string[] {
  try {
    return JSON.parse(localStorage.getItem(UNLOCKED_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUnlocked(ids: string[]) {
  localStorage.setItem(UNLOCKED_KEY, JSON.stringify(ids));
}

export function useAchievements() {
  const { profile } = useUserProfile();
  const { currentStreak } = useStreak();
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [unlockedIds, setUnlockedIds] = useState<string[]>(readUnlocked);

  // Gather stats for achievement checking
  const attempts = useLiveQuery(
    () => (profile ? db.attempts.where('local_user_id').equals(profile.id).toArray() : []),
    [profile?.id]
  );

  const totalAnswered = attempts?.length ?? 0;
  const totalCorrect = attempts?.filter(a => a.is_correct).length ?? 0;
  const totalAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const noHintAnswers = attempts?.filter(a => a.hints_used_count === 0 && a.is_correct).length ?? 0;
  const sessionsCompleted = attempts ? new Set(attempts.map(a => a.session_type + '_' + a.attempted_at.split('T')[0])).size : 0;

  // Mock exam stats (simplified)
  const mockAttempts = useLiveQuery(
    () => (profile ? db.mock_exam_attempts.where('local_user_id').equals(profile.id).toArray() : []),
    [profile?.id]
  );
  const mockExamsPassed = mockAttempts?.filter(a => a.passed).length ?? 0;

  // QOTD streak from localStorage
  const qotdStreak = (() => {
    try {
      return Number(localStorage.getItem('gabay_qotd_streak')) || 0;
    } catch { return 0; }
  })();

  // XP/Level data from user profile
  const totalXp = profile?.xp_total ?? 0;
  const level = profile?.level ?? 1;

  // Stats object for checking
  const stats: AchievementStats = {
    totalAnswered,
    totalCorrect,
    totalAccuracy,
    currentStreak,
    bestStreak: Math.max(currentStreak, Number(localStorage.getItem('gabay_best_streak')) || 0),
    totalXp,
    level,
    categoriesMastered: 0,
    mockExamsPassed,
    noHintAnswers,
    sessionsCompleted,
    qotdStreak,
  };

  // Check for newly unlocked achievements
  useEffect(() => {
    if (totalAnswered === 0) return;
    const newlyUnlocked = checkAchievements(unlockedIds, stats);
    if (newlyUnlocked.length > 0) {
      const newIds = [...unlockedIds, ...newlyUnlocked.map(a => a.id)];
      saveUnlocked(newIds);
      setUnlockedIds(newIds);
      // Show the first new achievement
      setNewAchievement(newlyUnlocked[0]!);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stats/unlockedIds are derived values that would cause infinite loops
  }, [totalAnswered, currentStreak, level, mockExamsPassed, qotdStreak]);

  const dismissAchievement = useCallback(() => {
    setNewAchievement(null);
  }, []);

  const allAchievements = ACHIEVEMENTS;
  const unlockedAchievements = allAchievements.filter(a => unlockedIds.includes(a.id));
  const lockedAchievements = allAchievements.filter(a => !unlockedIds.includes(a.id));

  return {
    newAchievement,
    dismissAchievement,
    allAchievements,
    unlockedAchievements,
    lockedAchievements,
    unlockedIds,
    stats,
    progress: unlockedIds.length,
    total: allAchievements.length,
  };
}
