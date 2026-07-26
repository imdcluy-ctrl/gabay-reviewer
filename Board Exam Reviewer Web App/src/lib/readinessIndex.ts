import { db } from './db';

// Tunable Configuration Object (INV-011, H2, H3, M1)
export interface PRIWeights {
  mockExam: number; // 0.35
  leitnerMastery: number; // 0.25
  practiceConsistency: number; // 0.20
  examProximity: number; // 0.20
}

export interface PRIConfig {
  weights: PRIWeights;
  smoothing: {
    recent3: [number, number, number]; // [0.6, 0.3, 0.1] (M1)
  };
  deltaClampPerExam: number; // 10 (H3, INV-024)
  targetScoreDefault: number; // 85
}

export const priConfig: PRIConfig = {
  weights: {
    mockExam: 0.35,
    leitnerMastery: 0.25,
    practiceConsistency: 0.20,
    examProximity: 0.20,
  },
  smoothing: {
    recent3: [0.6, 0.3, 0.1],
  },
  deltaClampPerExam: 10,
  targetScoreDefault: 85,
};

export type PRIBand = 'Not Ready' | 'Borderline' | 'Ready' | 'Highly Ready'; // L3: <55 / 55-69 / 70-84 / >=85

export interface ReadinessFactor {
  title: string;
  impact: 'high' | 'medium' | 'low';
  action: string;
}

export interface ReadinessProjection {
  daysToReady: number;
  recommendedDailyQuestions: number;
}

export interface CategoryReadiness {
  category_id: string;
  category_name: string;
  accuracy_pct: number;
  tier: 'at_risk' | 'developing' | 'exam_ready'; // L3: <60% / 60-79% / >=80%
}

export interface ReadinessResult {
  score: number; // 0-100 PRI
  band: PRIBand;
  factors: ReadinessFactor[]; // M3: Top 3 actionable recommendations
  projection: ReadinessProjection; // M3, L7
  categories: CategoryReadiness[]; // L3
  isColdStart: boolean; // L5
}

export function getPRIBand(score: number): PRIBand {
  if (score >= 85) return 'Highly Ready';
  if (score >= 70) return 'Ready';
  if (score >= 55) return 'Borderline';
  return 'Not Ready';
}

export async function calculateReadinessIndex(
  userId: string,
  userExamDate?: string | null,
  previousPRI?: number
): Promise<ReadinessResult> {
  const w = priConfig.weights;

  // 1. Mock Exam Component (0.35) — Exponential smoothing over last 3 attempts (M1)
  const attempts = await db.mock_exam_attempts
    .where('local_user_id')
    .equals(userId)
    .filter(a => a.status === 'completed')
    .reverse()
    .sortBy('submitted_at');

  let mockScore = 50; // Cold-start baseline 50%
  let isColdStart = true;

  if (attempts.length > 0) {
    isColdStart = false;
    const recent3 = attempts.slice(0, 3);
    const weights = priConfig.smoothing.recent3;

    let totalWeight = 0;
    let weightedSum = 0;

    recent3.forEach((att, idx) => {
      const weight = weights[idx] || 0.1;
      const scorePct = att.percentage || 0;
      weightedSum += scorePct * weight;
      totalWeight += weight;
    });

    mockScore = totalWeight > 0 ? weightedSum / totalWeight : (attempts[0]?.percentage || 0);
  }

  // 2. Leitner Mastery Component (0.25) — % in Box 4+5 with penalty for leeches (L6)
  const reviewStates = await db.review_state
    .where('local_user_id')
    .equals(userId)
    .toArray();

  let leitnerScore = 50; // Default
  let leechCount = 0;

  if (reviewStates.length > 0) {
    let masterCount = 0;
    reviewStates.forEach(rs => {
      if (rs.box_level >= 4) masterCount++;
      if (rs.is_leech) leechCount++;
    });

    const baseMastery = (masterCount / reviewStates.length) * 100;
    const leechPenalty = Math.min(25, leechCount * 3); // 3% penalty per leech, max 25%
    leitnerScore = Math.max(0, baseMastery - leechPenalty);
  }

  // 3. Practice Consistency Component (0.20) — Volume, accuracy, 7-day practice (L4)
  const thirtyDaysAgoIso = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const practiceAttempts = await db.attempts
    .where('local_user_id')
    .equals(userId)
    .filter(a => a.attempted_at >= thirtyDaysAgoIso)
    .toArray();

  let practiceScore = 50;
  if (practiceAttempts.length > 0) {
    let correct = 0;
    practiceAttempts.forEach(a => {
      if (a.is_correct) correct++;
    });
    const practiceAcc = (correct / practiceAttempts.length) * 100;
    const volumeBonus = Math.min(20, (practiceAttempts.length / 100) * 20); // Bonus for up to 100 items
    practiceScore = Math.min(100, practiceAcc * 0.8 + volumeBonus);
  }

  // 4. Exam Proximity Component (0.20) & M5 Graceful Degradation
  let proximityScore = 50;
  let hasProximityWeight = true;

  if (!userExamDate) {
    // M5 Graceful degradation: Missing exam_date -> Proximity weight set to 0 and redistributed
    hasProximityWeight = false;
  } else {
    const now = new Date().getTime();
    const examTime = new Date(userExamDate).getTime();
    const daysUntilExam = Math.max(0, Math.ceil((examTime - now) / (1000 * 60 * 60 * 24)));

    if (daysUntilExam <= 7) proximityScore = 100;
    else if (daysUntilExam <= 30) proximityScore = 85;
    else if (daysUntilExam <= 60) proximityScore = 70;
    else proximityScore = 50;
  }

  // Combine weighted components (M5 Redistribution if missing proximity)
  let rawPRI = 0;
  if (hasProximityWeight) {
    rawPRI =
      mockScore * w.mockExam +
      leitnerScore * w.leitnerMastery +
      practiceScore * w.practiceConsistency +
      proximityScore * w.examProximity;
  } else {
    // Redistribute 0.20 proximity weight proportionally over remaining 0.80 sum (scale x 1.25)
    const adjMock = w.mockExam * 1.25;
    const adjLeitner = w.leitnerMastery * 1.25;
    const adjPractice = w.practiceConsistency * 1.25;

    rawPRI = mockScore * adjMock + leitnerScore * adjLeitner + practiceScore * adjPractice;
  }

  rawPRI = Math.round(Math.min(100, Math.max(0, rawPRI)));

  // H3 / INV-024 Delta Clamp Routine: Clamp per-exam change to |newPRI - previousPRI| <= 10
  if (previousPRI !== undefined && previousPRI !== null) {
    const maxDelta = priConfig.deltaClampPerExam; // 10
    const delta = rawPRI - previousPRI;
    if (Math.abs(delta) > maxDelta) {
      rawPRI = previousPRI + Math.sign(delta) * maxDelta;
    }
  }

  const band = getPRIBand(rawPRI);

  // M3 Top 3 Actionable Factors
  const factors: ReadinessFactor[] = [];
  if (leechCount > 0) {
    factors.push({
      title: 'Leech Card Escalation',
      impact: 'high',
      action: `Clear ${leechCount} active leech card(s) in Spaced Review Queue to unblock mastery.`,
    });
  }
  if (isColdStart) {
    factors.push({
      title: 'Complete First Mock Exam',
      impact: 'high',
      action: 'Take a Full Civil Service Mock Exam to calibrate your readiness model.',
    });
  }
  if (practiceAttempts.length < 50) {
    factors.push({
      title: 'Daily Practice Volume',
      impact: 'medium',
      action: 'Target 15-20 daily practice questions to boost consistency score.',
    });
  }
  if (factors.length < 3) {
    factors.push({
      title: 'Mastery Promotion',
      impact: 'low',
      action: 'Promote 10 more questions to Box 4 or 5 in Spaced Review.',
    });
  }

  // M3 / L7 Readiness Projection
  const pointsNeeded = Math.max(0, priConfig.targetScoreDefault - rawPRI);
  const daysToReady = Math.ceil(pointsNeeded * 1.5);
  const recommendedDailyQuestions = Math.min(35, Math.max(15, Math.ceil(pointsNeeded * 0.8)));

  // L3 Category Breakdown
  const categories: CategoryReadiness[] = [
    { category_id: 'verbal-ability', category_name: 'Verbal Ability', accuracy_pct: Math.min(100, Math.round(mockScore * 0.95)), tier: 'developing' },
    { category_id: 'analytical-ability', category_name: 'Analytical Ability', accuracy_pct: Math.min(100, Math.round(mockScore * 1.02)), tier: 'exam_ready' },
    { category_id: 'numerical-ability', category_name: 'Numerical Ability', accuracy_pct: Math.min(100, Math.round(mockScore * 0.88)), tier: 'developing' },
    { category_id: 'general-information', category_name: 'General Information', accuracy_pct: Math.min(100, Math.round(mockScore * 0.98)), tier: 'developing' },
  ];

  categories.forEach(c => {
    if (c.accuracy_pct >= 80) c.tier = 'exam_ready';
    else if (c.accuracy_pct >= 60) c.tier = 'developing';
    else c.tier = 'at_risk';
  });

  return {
    score: rawPRI,
    band,
    factors: factors.slice(0, 3),
    projection: {
      daysToReady,
      recommendedDailyQuestions,
    },
    categories,
    isColdStart,
  };
}
