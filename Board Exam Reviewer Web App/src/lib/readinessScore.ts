import type { AnswerEvent, CategorySnapshot, ReadinessResult, ReadinessInputs } from '../types/readiness';

// ??? Constants ?????????????????????????????????????????????????

const PRIOR_WEIGHT = 50;        // Bayesian prior: equivalent to 50 unseen questions
const PRIOR_RATE = 0.25;         // Conservative 25% prior (realistic floor)
const PASS_THRESHOLD = 80;       // CSE passing = 80%+ (136/170)
const MIN_WEIGHTED_QUESTIONS = 100; // Minimum before showing any score
const MIN_CATEGORIES = 2;        // Must have attempted at least 2 categories
const MIN_CATEGORY_ATTEMPTS = 10; // At least 10 weighted in each category
const DECAY_HALF_LIFE_DAYS = 90; // Evidence older than 90 days is half-weighed

const CATEGORY_ORDER = [
  'numerical-ability',
  'verbal-ability',
  'analytical-ability',
  'clerical-ability',
  'general-information',
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  'numerical-ability': 'Numerical Ability',
  'verbal-ability': 'Verbal Ability',
  'analytical-ability': 'Analytical Ability',
  'clerical-ability': 'Clerical Ability',
  'general-information': 'General Information',
};

/** Get a user-friendly label for a category ID. */
export function getCategoryLabel(categoryId: string): string {
  return CATEGORY_LABELS[categoryId] || categoryId;
}

const SOURCE_WEIGHTS: Record<string, number> = {
  study: 1,
  short_test: 2,
  mock: 3,
};

// ??? Main ???????????????????????????????????????????????????????

export function calculateReadiness(inputs: ReadinessInputs): ReadinessResult {
  // 1. Collect and score all events
  const allEvents = collectEvents(inputs);
  const totalWeighted = allEvents.reduce((s, e) => s + e.sourceWeight, 0);
  const weightedCorrect = allEvents.reduce((s, e) => s + (e.isCorrect ? e.sourceWeight : 0), 0);

  // 2. Category breakdowns
  const categories = computeCategories(allEvents);

  // 3. Find weakest/strongest
  const sortedCats = [...categories].sort((a, b) => a.weightedTotal > 0 && b.weightedTotal > 0
    ? a.accuracy - b.accuracy
    : (a.weightedTotal > 0 ? -1 : 1));
  const weakestCategory = sortedCats.length > 0 && sortedCats[0]!.weightedTotal >= MIN_CATEGORY_ATTEMPTS
    ? sortedCats[0]!.categoryId : null;
  const strongestCategory = sortedCats.length > 0
    ? sortedCats[sortedCats.length - 1]!.categoryId : null;

  // 4. Category coverage check
  const catsWithData = categories.filter(c => c.weightedTotal >= MIN_CATEGORY_ATTEMPTS);
  const categoryCoverageRatio = catsWithData.length / Math.min(categories.length, 4);

  // 5. Gate: enough data?
  if (totalWeighted < MIN_WEIGHTED_QUESTIONS || catsWithData.length < MIN_CATEGORIES) {
    return insufficientData(totalWeighted, catsWithData.length, categories);
  }

  // 6. Bayesian estimate
  const bayesianScore = (weightedCorrect + PRIOR_WEIGHT * PRIOR_RATE) / (totalWeighted + PRIOR_WEIGHT);

  // 7. Category adjustment
  const categoryScore = catsWithData.length > 0
    ? catsWithData.reduce((s, c) => s + c.accuracy, 0) / catsWithData.length
    : bayesianScore;

  // 8. Trend from recency
  const trend = computeTrend(allEvents);
  const trendAdjustment = trend === 'improving' ? 0.03 : trend === 'declining' ? -0.05 : 0;

  // 9. Blend: 70% Bayesian, 20% category, 10% trend
  const rawScore = 0.70 * bayesianScore + 0.20 * categoryScore + 0.10 * (bayesianScore + trendAdjustment);
  const finalScore = Math.max(0, Math.min(100, Math.round(rawScore * 100)));

  // 10. Confidence
  const { confidence, confidenceInterval } = computeConfidence(totalWeighted);

  // 11. Message
  const message = buildMessage(finalScore, totalWeighted, strongestCategory, weakestCategory);

  return {
    score: finalScore,
    passingThreshold: PASS_THRESHOLD,
    confidence,
    confidenceInterval,
    trend,
    categories,
    totalWeightedQuestions: Math.round(totalWeighted),
    message,
    weakestCategory,
    strongestCategory,
  };
}

// ??? Helpers ????????????????????????????????????????????????????

function collectEvents(inputs: ReadinessInputs): AnswerEvent[] {
  const events: AnswerEvent[] = [];

  for (const a of inputs.studyAttempts) {
    events.push({ ...a, sourceWeight: SOURCE_WEIGHTS[a.source] || 1 });
  }
  for (const a of inputs.mockAttempts) {
    events.push({ ...a, sourceWeight: SOURCE_WEIGHTS[a.source] || 3 });
  }
  for (const a of inputs.shortTestAttempts) {
    events.push({ ...a, sourceWeight: SOURCE_WEIGHTS[a.source] || 2 });
  }

  return events;
}

function computeCategories(events: AnswerEvent[]): CategorySnapshot[] {
  const map = new Map<string, { correct: number; total: number; wCorrect: number; wTotal: number }>();

  for (const e of events) {
    if (!map.has(e.categoryId)) {
      map.set(e.categoryId, { correct: 0, total: 0, wCorrect: 0, wTotal: 0 });
    }
    const entry = map.get(e.categoryId)!;
    entry.total++;
    entry.wTotal += e.sourceWeight;
    if (e.isCorrect) {
      entry.correct++;
      entry.wCorrect += e.sourceWeight;
    }
  }

  return CATEGORY_ORDER
    .filter(id => map.has(id))
    .map(id => {
      const d = map.get(id)!;
      return {
        categoryId: id,
        correct: d.correct,
        total: d.total,
        accuracy: d.total > 0 ? d.wCorrect / d.wTotal : 0,
        weightedCorrect: Math.round(d.wCorrect),
        weightedTotal: Math.round(d.wTotal),
      };
    });
}

function computeTrend(events: AnswerEvent[]): 'improving' | 'stable' | 'declining' | 'insufficient_data' {
  if (events.length < 40) return 'insufficient_data';

  const sorted = [...events].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const mid = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, mid);
  const secondHalf = sorted.slice(mid);

  const firstScore = firstHalf.reduce((s, e) => s + (e.isCorrect ? e.sourceWeight : 0), 0) /
    firstHalf.reduce((s, e) => s + e.sourceWeight, 0);
  const secondScore = secondHalf.reduce((s, e) => s + (e.isCorrect ? e.sourceWeight : 0), 0) /
    secondHalf.reduce((s, e) => s + e.sourceWeight, 0);

  const diff = secondScore - firstScore;
  if (diff > 0.05) return 'improving';
  if (diff < -0.05) return 'declining';
  return 'stable';
}

function computeConfidence(totalWeighted: number): { confidence: 'very_low' | 'low' | 'medium' | 'high'; confidenceInterval: number } {
  if (totalWeighted < 100) return { confidence: 'very_low', confidenceInterval: 15 };
  if (totalWeighted < 300) return { confidence: 'low', confidenceInterval: 10 };
  if (totalWeighted < 500) return { confidence: 'medium', confidenceInterval: 5 };
  return { confidence: 'high', confidenceInterval: 2 };
}

function insufficientData(
  totalWeighted: number,
  categoriesMet: number,
  categories: CategorySnapshot[]
): ReadinessResult {
  const needed = Math.max(1, MIN_WEIGHTED_QUESTIONS - totalWeighted);
  return {
    score: 0,
    passingThreshold: PASS_THRESHOLD,
    confidence: 'very_low',
    confidenceInterval: 15,
    trend: 'insufficient_data',
    categories,
    totalWeightedQuestions: Math.round(totalWeighted),
    message: tooEarly(needed, categoriesMet),
    weakestCategory: null,
    strongestCategory: null,
  };
}

function tooEarly(needed: number, catsMet: number): string {
  if (catsMet < MIN_CATEGORIES) {
    return 'Answer questions in at least 2 subject categories to get a readiness estimate.';
  }
  return 'Keep studying! You need about ' + needed + ' more practice attempts before a reliable estimate is ready.';
}

function buildMessage(
  score: number,
  totalQ: number,
  strongest: string | null,
  weakest: string | null
): string {
  let msg = '';
  if (score >= 80) {
    msg = 'Your practice results suggest you are in a strong range. Keep reviewing your weaker areas.';
  } else if (score >= 70) {
    msg = 'You are approaching a strong range. Focus on your weakest categories to improve further.';
  } else if (score >= 60) {
    msg = 'You are building solid skills. Targeted practice on weak subjects will help raise your estimated readiness.';
  } else {
    msg = 'Keep building your foundation. Consistent practice across all categories will improve your results.';
  }

  if (strongest && weakest) {
    const strongLabel = CATEGORY_LABELS[strongest] || strongest;
    const weakLabel = CATEGORY_LABELS[weakest] || weakest;
    msg += ' Strongest: ' + strongLabel + '. Needs focus: ' + weakLabel + '.';
  }

  return msg + ' (' + Math.round(totalQ) + ' weighted questions analyzed)';
}
