export interface StudyPlan {
  dailyMinutes: number;
  categoryPlans: CategoryPlan[];
  targetScore: number;
  currentScore: number;
  daysUntilExam: number;
  message: string;
  sufficient: boolean;
}

export interface CategoryPlan {
  categoryId: string;
  categoryName: string;
  currentAccuracy: number;
  targetAccuracy: number;
  minutesPerDay: number;
  questionsRecommended: number;
  priority: 'high' | 'medium' | 'low';
}

const CATEGORY_WEIGHTS: Record<string, number> = {
  'numerical-ability': 0.30,
  'verbal-ability': 0.30,
  'analytical-ability': 0.25,
  'clerical-ability': 0.15,
  'general-information': 0.00,
};

const CATEGORY_NAMES: Record<string, string> = {
  'numerical-ability': 'Numerical Ability',
  'verbal-ability': 'Verbal Ability',
  'analytical-ability': 'Analytical Ability',
  'clerical-ability': 'Clerical Ability',
  'general-information': 'General Information',
};

const AVG_QUESTIONS_PER_10MIN = 5; // Rough estimate
const TARGET_ACCURACY = 85; // Target accuracy for passing

export function generateStudyPlan(
  categoryAccuracies: { categoryId: string; accuracy: number; questionsAnswered: number }[],
  examDate: string | null,
  totalQuestions: number,
): StudyPlan | null {
  if (!examDate || categoryAccuracies.length === 0) return null;

  const examTime = new Date(examDate).getTime();
  const nowTime = new Date().getTime();
  const daysUntilExam = Math.max(1, Math.ceil((examTime - nowTime) / (1000 * 60 * 60 * 24)));

  // Calculate current weighted score
  let currentScore = 0;
  let totalWeight = 0;

  for (const [catId, weight] of Object.entries(CATEGORY_WEIGHTS)) {
    const cat = categoryAccuracies.find(c => c.categoryId === catId);
    if (cat && cat.questionsAnswered >= 5) {
      currentScore += (cat.accuracy / 100) * weight;
      totalWeight += weight;
    }
  }

  if (totalWeight === 0) return null;
  currentScore = Math.round((currentScore / totalWeight) * 100);

  // Calculate how much improvement is needed per day
  const scoreDifference = Math.max(0, TARGET_ACCURACY - currentScore);
  const pointsPerDay = scoreDifference / Math.max(1, daysUntilExam * 0.7); // 70% of days available
  const baseDailyMinutes = Math.min(90, Math.max(10, Math.round(pointsPerDay * 2)));

  // Distribute daily minutes across categories based on weight * gap
  const categoryPlans: CategoryPlan[] = [];

  for (const [catId, weight] of Object.entries(CATEGORY_WEIGHTS)) {
    const cat = categoryAccuracies.find(c => c.categoryId === catId);
    const currentAccuracy = cat?.accuracy ?? 0;
    const gap = Math.max(0, TARGET_ACCURACY - currentAccuracy);

    let priority: 'high' | 'medium' | 'low' = 'low';
    if (gap > 20) priority = 'high';
    else if (gap > 10) priority = 'medium';

    const normalizedWeight = gap > 0 ? (weight * (gap / 100)) : 0;
    const minutesPerDay = Math.max(
      5,
      Math.round(normalizedWeight * baseDailyMinutes * 2)
    );
    const questionsRecommended = Math.round(minutesPerDay * AVG_QUESTIONS_PER_10MIN / 10);

    categoryPlans.push({
      categoryId: catId,
      categoryName: CATEGORY_NAMES[catId] || catId,
      currentAccuracy,
      targetAccuracy: TARGET_ACCURACY,
      minutesPerDay,
      questionsRecommended,
      priority,
    });
  }

  // Sort by priority
  categoryPlans.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  const totalDailyMinutes = categoryPlans.reduce((s, c) => s + c.minutesPerDay, 0);

  // Message
  let message = '';
  if (daysUntilExam <= 7) {
    message = 'Only ' + daysUntilExam + ' days left! Focus on mock exams and weak areas.';
  } else if (currentScore >= TARGET_ACCURACY) {
    message = 'You are on track! Maintain your current pace to stay exam-ready.';
  } else if (scoreDifference <= 10) {
    message = 'You are close to passing! Consistent practice will get you there.';
  } else {
    message = 'You have work to do, but there is enough time if you stay consistent.';
  }

  return {
    dailyMinutes: totalDailyMinutes,
    categoryPlans,
    targetScore: TARGET_ACCURACY,
    currentScore,
    daysUntilExam,
    message,
    sufficient: daysUntilExam > 0 && totalDailyMinutes <= 120,
  };
}
