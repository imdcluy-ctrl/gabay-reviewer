import { useEffect, useState } from 'react';
import { useUserProfile } from './useUserProfile';
import {
  computeStreakEngagementStats,
  type StreakEngagementStats,
} from '../lib/streakMetrics';

const EMPTY_STATS: StreakEngagementStats = {
  totalDaysPlayed: 0,
  currentPlayStreak: 0,
  bestPlayStreak: 0,
  avgFinalStreak: 0,
  totalSessions: 0,
};

export function useStreakMetrics() {
  const { profile } = useUserProfile();
  const [stats, setStats] = useState<StreakEngagementStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!profile) {
        setStats(EMPTY_STATS);
        setLoading(false);
        return;
      }
      const result = await computeStreakEngagementStats(profile.id);
      if (!cancelled) {
        setStats(result);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [profile]);

  return { stats, loading };
}
