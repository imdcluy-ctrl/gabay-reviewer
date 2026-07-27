export const XP_VALUES = {
  CORRECT_ANSWER: 15,
  WRONG_ANSWER: 5,
  STREAK_BONUS_3D: 1.5,   // multiplier
  STREAK_BONUS_7D: 2.0,
  STREAK_BONUS_30D: 3.0,
  FIRST_DAILY_BONUS: 25,
  SESSION_COMPLETE: 50,
  NO_HINTS_BONUS: 10,
  MOCK_EXAM_COMPLETE: 100,
  ACHIEVEMENT: 50,
} as const;

export interface LevelInfo {
  level: number;
  title: string;
  xpRequired: number;    // XP needed for this level
  cumulativeXp: number;  // Total XP needed to reach this level
}

export const LEVELS: LevelInfo[] = [
  { level: 1, title: 'Novice', xpRequired: 0, cumulativeXp: 0 },
  { level: 2, title: 'Scholar', xpRequired: 100, cumulativeXp: 100 },
  { level: 3, title: 'Apprentice', xpRequired: 200, cumulativeXp: 300 },
  { level: 4, title: 'Adept', xpRequired: 300, cumulativeXp: 600 },
  { level: 5, title: 'Expert', xpRequired: 400, cumulativeXp: 1000 },
  { level: 6, title: 'Master', xpRequired: 500, cumulativeXp: 1500 },
  { level: 7, title: 'Grandmaster', xpRequired: 600, cumulativeXp: 2100 },
  { level: 8, title: 'Sage', xpRequired: 700, cumulativeXp: 2800 },
  { level: 9, title: 'Legend', xpRequired: 800, cumulativeXp: 3600 },
  { level: 10, title: 'Gabay Elite', xpRequired: 900, cumulativeXp: 4500 },
];

/** Calculate level from total XP. Returns the highest level reached. */
export function calculateLevel(totalXp: number): LevelInfo {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    const level = LEVELS[i]!;
    if (level && totalXp >= level.cumulativeXp) {
      return level;
    }
  }
  return LEVELS[0]!;
}

/** Get the next level, or the current level if already maxed */
export function getNextLevel(currentLevel: number): LevelInfo | null {
  const idx = LEVELS.findIndex(l => l.level === currentLevel);
  if (idx < 0 || idx >= LEVELS.length - 1) return null;
  const next = LEVELS[idx + 1];
  return next ? next : null;
}

/** Calculate XP progress percentage toward next level */
export function getXpProgress(currentLevel: number, totalXp: number): number {
  const nextLevel = getNextLevel(currentLevel);
  const currentLevelInfo = LEVELS.find(l => l.level === currentLevel);
  if (!nextLevel || !currentLevelInfo) return 100;

  const xpIntoLevel = totalXp - currentLevelInfo.cumulativeXp;
  const xpNeeded = nextLevel.xpRequired;
  return Math.min(100, Math.round((xpIntoLevel / xpNeeded) * 100));
}

/** Get the level emoji */
export function getLevelEmoji(level: number): string {
  const emojis: Record<number, string> = {
    1: '🌱', 2: '📖', 3: '🔧', 4: '⚔️', 5: '🎯',
    6: '👑', 7: '🏆', 8: '🔮', 9: '🌟', 10: '💎',
  };
  return emojis[level] || '❓';
}
