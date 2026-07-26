import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { useUserProfile } from './useUserProfile';

export function useStreak(): { currentStreak: number; lastSevenDays: boolean[] } {
  const { profile } = useUserProfile();

  const streakData = useLiveQuery(async () => {
    if (!profile) return { currentStreak: 0, lastSevenDays: Array(7).fill(false) };

    const attempts = await db.attempts
      .where('local_user_id')
      .equals(profile.id)
      .toArray();

    if (attempts.length === 0) {
      return { currentStreak: 0, lastSevenDays: Array(7).fill(false) };
    }

    // Extract unique dates formatted as YYYY-MM-DD
    const dateSet = new Set<string>();
    attempts.forEach(a => {
      const dateStr = new Date(a.attempted_at).toLocaleDateString('en-CA'); // YYYY-MM-DD
      dateSet.add(dateStr);
    });

    const today = new Date();

    // Calculate last 7 days array (index 0 = 6 days ago, index 6 = today)
    const lastSevenDays: boolean[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dStr = d.toLocaleDateString('en-CA');
      lastSevenDays.push(dateSet.has(dStr));
    }

    // Calculate current streak starting from today (or yesterday if user hasn't studied today yet)
    let currentStreak = 0;
    let checkDate = new Date(today);
    let checkStr = checkDate.toLocaleDateString('en-CA');

    if (!dateSet.has(checkStr)) {
      // Check if user studied yesterday
      checkDate.setDate(checkDate.getDate() - 1);
      checkStr = checkDate.toLocaleDateString('en-CA');
    }

    while (dateSet.has(checkStr)) {
      currentStreak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
      checkStr = checkDate.toLocaleDateString('en-CA');
    }

    return { currentStreak, lastSevenDays };
  }, [profile]);

  return streakData || { currentStreak: 0, lastSevenDays: Array(7).fill(false) };
}
