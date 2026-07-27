export interface SnapshotResult {
  snapshotScore: number;
  confidenceInterval: number;
  trend: "improving" | "stable" | "declining" | "insufficient_data";
  confidence: "low" | "medium" | "high";
  message: string;
  details: {
    baseScore: number;
    categoryAdjustment: number;
    trendAdjustment: number;
    streakBonus: number;
    decayPenalty: number;
  };
}

interface Attempt {
  question_id: string;
  is_correct: boolean;
  attempted_at: string;
  hints_used_count: number;
}

interface CategoryMap {
  [questionId: string]: string;
}

export function calculateSnapshotScore(
  attempts: Attempt[],
  questionCategoryMap: CategoryMap,
  currentStreak: number,
  daysUntilExam: number | null,
  _totalQuestionsAnswered: number,
): SnapshotResult {
  if (attempts.length < 30) {
    return {
      snapshotScore: 0,
      confidenceInterval: 0,
      trend: "insufficient_data",
      confidence: "low",
      message: "Answer at least 30 questions to get a prediction.",
      details: { baseScore: 0, categoryAdjustment: 0, trendAdjustment: 0, streakBonus: 0, decayPenalty: 0 },
    };
  }

  const PRIOR_WEIGHT = 30;
  const PRIOR_RATE = 0.50;
  const totalCorrect = attempts.filter(a => a.is_correct).length;
  const bayesianScore = (totalCorrect + PRIOR_WEIGHT * PRIOR_RATE) / (attempts.length + PRIOR_WEIGHT);

  const categoriesAttempted = new Set<string>();
  attempts.forEach(a => {
    const cat = questionCategoryMap[a.question_id];
    if (cat) categoriesAttempted.add(cat);
  });
  const categoryCoverage = categoriesAttempted.size / 4;

  const categoryWeights: Record<string, number> = {
    "numerical-ability": 0.30,
    "verbal-ability": 0.30,
    "analytical-ability": 0.25,
    "clerical-ability": 0.15,
  };

  let weightedScore = 0;
  let totalWeight = 0;
  for (const [catId, weight] of Object.entries(categoryWeights)) {
    const catAttempts = attempts.filter(a => questionCategoryMap[a.question_id] === catId);
    if (catAttempts.length >= 5) {
      const catCorrect = catAttempts.filter(a => a.is_correct).length;
      const catScore = (catCorrect + 5 * 0.50) / (catAttempts.length + 5);
      weightedScore += catScore * weight;
      totalWeight += weight;
    }
  }

  const categoryAdjustedScore = totalWeight > 0 ? weightedScore / totalWeight : bayesianScore;

  const sorted = [...attempts].sort((a, b) =>
    new Date(a.attempted_at).getTime() - new Date(b.attempted_at).getTime()
  );

  let trendAdjustment = 0;
  let trend: "improving" | "stable" | "declining" | "insufficient_data" = "stable";

  if (sorted.length >= 40) {
    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2));
    const firstScore = firstHalf.filter(a => a.is_correct).length / firstHalf.length;
    const secondScore = secondHalf.filter(a => a.is_correct).length / secondHalf.length;
    const diff = secondScore - firstScore;

    if (diff > 0.05) {
      trend = "improving";
      trendAdjustment = 0.03;
    } else if (diff < -0.05) {
      trend = "declining";
      trendAdjustment = -0.05;
    }
  }

  const streakBonus = Math.min(currentStreak, 30) / 30 * 0.02;

  const decayPenalty = daysUntilExam !== null && daysUntilExam > 60
    ? (daysUntilExam - 60) / 365 * 0.05
    : 0;

  const rawScore = categoryAdjustedScore + categoryCoverage * 0.03 + trendAdjustment + streakBonus - decayPenalty;
  const snapshotScore = Math.max(0, Math.min(100, Math.round(rawScore * 100)));

  const confidenceInterval = attempts.length < 100 ? 8 :
    attempts.length < 300 ? 5 :
    attempts.length < 500 ? 3 : 2;

  const confidence = attempts.length < 100 ? "low" :
    attempts.length < 300 ? "medium" : "high";

  let message = "";
  if (snapshotScore >= 85) {
    message = "Your practice accuracy is in a strong range. Keep up the great work.";
  } else if (snapshotScore >= 75) {
    message = "Your recent accuracy suggests you're building solid skills. Focus on weak areas to boost further.";
  } else if (snapshotScore >= 60) {
    message = "You're making progress. Targeted practice on weak subjects will help.";
  } else {
    message = "Keep building your foundation. Consistent practice will improve your accuracy.";
  }

  if (daysUntilExam !== null && daysUntilExam <= 30) {
    message += " With " + daysUntilExam + " days left, focus on review and mock exams.";
  }

  return {
    snapshotScore,
    confidenceInterval,
    trend,
    confidence,
    message,
    details: {
      baseScore: Math.round(bayesianScore * 100),
      categoryAdjustment: Math.round(categoryCoverage * 3),
      trendAdjustment: Math.round(trendAdjustment * 100),
      streakBonus: Math.round(streakBonus * 100),
      decayPenalty: Math.round(decayPenalty * 100),
    },
  };
}
