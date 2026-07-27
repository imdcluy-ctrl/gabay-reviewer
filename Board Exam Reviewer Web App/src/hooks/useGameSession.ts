import { useCallback, useEffect, useState } from 'react';
import { db } from '../lib/db';
import type { StreakSession } from '../types/game';
import { v4 as uuidv4 } from 'uuid';

const BEST_STREAK_KEY = 'gabay_best_streak';

function loadBestStreak(): number {
  try { return Number(localStorage.getItem(BEST_STREAK_KEY)) || 0; }
  catch { return 0; }
}

export function useGameSession() {
  const [bestStreak, setBestStreak] = useState(loadBestStreak);
  const [todaySession, setTodaySession] = useState<StreakSession | null>(null);
  const [sessions, setSessions] = useState<StreakSession[]>([]);
  const [loading, setLoading] = useState(true);

  const loadToday = useCallback(async () => {
    const today = new Date().toLocaleDateString('en-CA');
    const all = await db.streak_sessions
      .orderBy('createdAt')
      .reverse()
      .toArray();
    setSessions(all);
    const found = all.find(s => s.date === today);
    setTodaySession(found || null);
    setLoading(false);
  }, []);

  useEffect(() => { loadToday(); }, [loadToday]);

  const saveSession = useCallback(async (session: Omit<StreakSession, 'id' | 'createdAt'>) => {
    const record: StreakSession = {
      ...session,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    await db.streak_sessions.put(record);
    setTodaySession(record);
    setSessions(prev => [record, ...prev]);

    // Update best streak
    if (session.finalStreak > bestStreak) {
      setBestStreak(session.finalStreak);
      localStorage.setItem(BEST_STREAK_KEY, String(session.finalStreak));
    }
    return record;
  }, [bestStreak]);

  const alreadyPlayedToday = todaySession !== null;

  return { bestStreak, todaySession, sessions, loading, alreadyPlayedToday, saveSession };
}
