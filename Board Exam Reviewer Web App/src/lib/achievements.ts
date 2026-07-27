export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: 'progress' | 'streak' | 'mastery' | 'social' | 'special';
  condition: (stats: AchievementStats) => boolean;
  hidden?: boolean;
}

export interface AchievementStats {
  totalAnswered: number;
  totalCorrect: number;
  totalAccuracy: number;
  currentStreak: number;
  bestStreak: number;
  totalXp: number;
  level: number;
  categoriesMastered: number;
  mockExamsPassed: number;
  noHintAnswers: number;
  sessionsCompleted: number;
  qotdStreak: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Progress achievements
  {
    id: 'first_question',
    title: 'First Step',
    description: 'Answer your first question',
    emoji: '👣',
    category: 'progress',
    condition: (s) => s.totalAnswered >= 1,
  },
  {
    id: 'centurion',
    title: 'Centurion',
    description: 'Answer 100 questions',
    emoji: '💯',
    category: 'progress',
    condition: (s) => s.totalAnswered >= 100,
  },
  {
    id: 'scholar',
    title: 'Scholar',
    description: 'Answer 500 questions',
    emoji: '📚',
    category: 'progress',
    condition: (s) => s.totalAnswered >= 500,
  },
  {
    id: 'master_scholar',
    title: 'Master Scholar',
    description: 'Answer 1,000 questions',
    emoji: '🎓',
    category: 'progress',
    condition: (s) => s.totalAnswered >= 1000,
  },
  {
    id: 'grinder',
    title: 'The Grinder',
    description: 'Answer 2,500 questions',
    emoji: '⛏️',
    category: 'progress',
    condition: (s) => s.totalAnswered >= 2500,
  },

  // Streak achievements
  {
    id: 'streak_3',
    title: 'Getting Started',
    description: 'Reach a 3-day streak',
    emoji: '🌱',
    category: 'streak',
    condition: (s) => s.currentStreak >= 3 || s.bestStreak >= 3,
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Reach a 7-day streak',
    emoji: '⚔️',
    category: 'streak',
    condition: (s) => s.currentStreak >= 7 || s.bestStreak >= 7,
  },
  {
    id: 'streak_14',
    title: 'Fortnight Champion',
    description: 'Reach a 14-day streak',
    emoji: '🛡️',
    category: 'streak',
    condition: (s) => s.currentStreak >= 14 || s.bestStreak >= 14,
  },
  {
    id: 'streak_30',
    title: 'Monthly Master',
    description: 'Reach a 30-day streak',
    emoji: '📅',
    category: 'streak',
    condition: (s) => s.currentStreak >= 30 || s.bestStreak >= 30,
  },
  {
    id: 'streak_100',
    title: 'Century Streak',
    description: 'Reach a 100-day streak',
    emoji: '♾️',
    category: 'streak',
    condition: (s) => s.currentStreak >= 100 || s.bestStreak >= 100,
  },

  // Mastery achievements
  {
    id: 'accuracy_80',
    title: 'Sharpshooter',
    description: 'Achieve 80% overall accuracy',
    emoji: '🎯',
    category: 'mastery',
    condition: (s) => s.totalAnswered >= 50 && s.totalAccuracy >= 80,
  },
  {
    id: 'accuracy_90',
    title: 'Elite Marksman',
    description: 'Achieve 90% overall accuracy',
    emoji: '🔥',
    category: 'mastery',
    condition: (s) => s.totalAnswered >= 100 && s.totalAccuracy >= 90,
  },
  {
    id: 'no_hints_50',
    title: 'Self-Reliant',
    description: 'Answer 50 questions without using hints',
    emoji: '💪',
    category: 'mastery',
    condition: (s) => s.noHintAnswers >= 50,
  },
  {
    id: 'no_hints_200',
    title: 'Independent Thinker',
    description: 'Answer 200 questions without using hints',
    emoji: '🧠',
    category: 'mastery',
    condition: (s) => s.noHintAnswers >= 200,
  },
  {
    id: 'level_5',
    title: 'Rising Expert',
    description: 'Reach Level 5 (Expert)',
    emoji: '📈',
    category: 'mastery',
    condition: (s) => s.level >= 5,
  },
  {
    id: 'level_10',
    title: 'Gabay Elite',
    description: 'Reach Level 10 (Gabay Elite)',
    emoji: '💎',
    category: 'mastery',
    condition: (s) => s.level >= 10,
  },

  // Special achievements
  {
    id: 'qotd_7',
    title: 'Daily Devotee',
    description: 'Complete 7 QOTDs in a row',
    emoji: '🌞',
    category: 'special',
    condition: (s) => s.qotdStreak >= 7,
  },
  {
    id: 'qotd_30',
    title: 'Solar Champion',
    description: 'Complete 30 QOTDs in a row',
    emoji: '☀️',
    category: 'special',
    condition: (s) => s.qotdStreak >= 30,
  },
  {
    id: 'session_50',
    title: 'Dedicated Student',
    description: 'Complete 50 study sessions',
    emoji: '📝',
    category: 'special',
    condition: (s) => s.sessionsCompleted >= 50,
  },
  {
    id: 'mock_pass',
    title: 'Exam Ready',
    description: 'Pass your first mock exam',
    emoji: '✅',
    category: 'special',
    condition: (s) => s.mockExamsPassed >= 1,
  },
  {
    id: 'mock_pass_5',
    title: 'Battle Tested',
    description: 'Pass 5 mock exams',
    emoji: '🏅',
    category: 'special',
    condition: (s) => s.mockExamsPassed >= 5,
  },
];

export function checkAchievements(
  currentIds: string[],
  stats: AchievementStats
): Achievement[] {
  return ACHIEVEMENTS.filter(
    (a) => !currentIds.includes(a.id) && a.condition(stats)
  );
}
