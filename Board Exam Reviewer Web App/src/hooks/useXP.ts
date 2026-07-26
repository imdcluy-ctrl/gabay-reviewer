import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { useUserProfile } from './useUserProfile';
import { calculateLevel, getXpProgress, getNextLevel } from '../lib/xp';
import { v4 as uuidv4 } from 'uuid';

type XpSource = 'correct' | 'wrong' | 'streak_bonus' | 'first_daily' | 'session_complete' | 'no_hints_bonus' | 'mock_complete' | 'achievement';

interface AwardXpParams {
  amount: number;
  source: XpSource;
  questionId?: string;
  streakMultiplier?: number;
}

export function useXP() {
  const { profile } = useUserProfile();
  const userId = profile?.id;

  const profileData = useLiveQuery(
    () => (userId ? db.user_profile.get(userId) : Promise.resolve(undefined)),
    [userId]
  ) as { xp_total?: number; level?: number } | undefined;

  const totalXpValue = profileData?.xp_total ?? 0;
  const currentLevel = profileData?.level ?? 1;
  const levelInfo = calculateLevel(totalXpValue);
  const nextLevel = getNextLevel(currentLevel);
  const progress = getXpProgress(currentLevel, totalXpValue);

  const awardXp = useCallback(async (params: AwardXpParams) => {
    if (!userId) return { newTotal: 0, leveledUp: false, newLevel: 1 };

    const { amount, source, questionId, streakMultiplier } = params;
    const finalAmount = streakMultiplier ? Math.round(amount * streakMultiplier) : amount;

    const userProfile = await db.user_profile.get(userId);
    const currentXp = userProfile?.xp_total ?? 0;
    const currentLvl = userProfile?.level ?? 1;

    const newTotal = currentXp + finalAmount;
    const newLevelInfo = calculateLevel(newTotal);
    const leveledUp = newLevelInfo.level > currentLvl;

    await db.user_profile.update(userId, {
      xp_total: newTotal,
      level: newLevelInfo.level,
    });

    await db.xp_history.add({
      id: uuidv4(),
      local_user_id: userId,
      xp_amount: finalAmount,
      source: source,
      question_id: questionId ?? '',
      streak_multiplier: streakMultiplier ?? 0,
      created_at: new Date().toISOString(),
    });

    return { newTotal, leveledUp, newLevel: newLevelInfo.level };
  }, [userId]);

  return {
    totalXp: totalXpValue,
    currentLevel,
    levelInfo,
    nextLevel,
    progress,
    awardXp,
  };
}
