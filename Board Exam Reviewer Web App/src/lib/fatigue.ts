import type { MockExamAnswer } from '../types/mockExam';

export interface QuartileAccuracy {
  quartile: 1 | 2 | 3 | 4;
  total: number;
  correct: number;
  percentage: number;
}

export interface FatigueAnalysis {
  quartileAccuracies: {
    q1: QuartileAccuracy;
    q2: QuartileAccuracy;
    q3: QuartileAccuracy;
    q4: QuartileAccuracy;
  };
  fatigueDelta: number; // e.g. 0.18 for 18 percentage points drop
  hasFatigueDeficit: boolean; // true if fatigueDelta >= 0.15 (INV-023)
  recommendation: string;
}

export function calculateFatigueMetrics(answers: MockExamAnswer[]): FatigueAnalysis {
  if (answers.length < 4) {
    const defaultQuartile: QuartileAccuracy = { quartile: 1, total: 0, correct: 0, percentage: 0 };
    return {
      quartileAccuracies: {
        q1: { ...defaultQuartile, quartile: 1 },
        q2: { ...defaultQuartile, quartile: 2 },
        q3: { ...defaultQuartile, quartile: 3 },
        q4: { ...defaultQuartile, quartile: 4 },
      },
      fatigueDelta: 0,
      hasFatigueDeficit: false,
      recommendation: 'Complete a full exam session to enable cognitive stamina analysis.',
    };
  }

  // Sort chronologically by question_index
  const sorted = [...answers].sort((a, b) => a.question_index - b.question_index);
  const totalItems = sorted.length;
  const chunkSize = Math.floor(totalItems / 4);

  const getQuartileStats = (qNum: 1 | 2 | 3 | 4, slice: MockExamAnswer[]): QuartileAccuracy => {
    let correct = 0;
    for (const a of slice) {
      if (a.chosen_option && a.chosen_option === a.content_snapshot.correct_option) {
        correct++;
      }
    }
    const pct = slice.length > 0 ? Number(((correct / slice.length) * 100).toFixed(1)) : 0;
    return {
      quartile: qNum,
      total: slice.length,
      correct,
      percentage: pct,
    };
  };

  const q1Slice = sorted.slice(0, chunkSize);
  const q2Slice = sorted.slice(chunkSize, chunkSize * 2);
  const q3Slice = sorted.slice(chunkSize * 2, chunkSize * 3);
  const q4Slice = sorted.slice(chunkSize * 3);

  const q1Stats = getQuartileStats(1, q1Slice);
  const q2Stats = getQuartileStats(2, q2Slice);
  const q3Stats = getQuartileStats(3, q3Slice);
  const q4Stats = getQuartileStats(4, q4Slice);

  // Fatigue Delta = (Q1 accuracy - Q4 accuracy) in decimal
  const delta = Number(((q1Stats.percentage - q4Stats.percentage) / 100).toFixed(2));
  // INV-023: Fatigue warning fires if delta >= 0.15 (15 percentage points)
  const hasFatigueDeficit = delta >= 0.15;

  let recommendation = '';
  if (hasFatigueDeficit) {
    const dropPp = Math.round(delta * 100);
    recommendation = `⚠️ Cognitive Stamina Warning: Your accuracy dropped by ${dropPp}% between Quartile 1 (${q1Stats.percentage}%) and Quartile 4 (${q4Stats.percentage}%). We recommend building endurance using 50-minute Pomodoro study blocks and taking a short 5-minute breather before the final section.`;
  } else if (delta <= -0.05) {
    recommendation = `🚀 Excellent Momentum! Your performance actually improved in the final stretch (${q4Stats.percentage}% vs ${q1Stats.percentage}% in Q1). You maintain focus exceptionally well under pressure!`;
  } else {
    recommendation = `✅ Steady Stamina: Your accuracy remained consistent throughout the exam (${q1Stats.percentage}% Q1 ➔ ${q4Stats.percentage}% Q4). Your focus level is well-calibrated for testing duration.`;
  }

  return {
    quartileAccuracies: {
      q1: q1Stats,
      q2: q2Stats,
      q3: q3Stats,
      q4: q4Stats,
    },
    fatigueDelta: delta,
    hasFatigueDeficit,
    recommendation,
  };
}
