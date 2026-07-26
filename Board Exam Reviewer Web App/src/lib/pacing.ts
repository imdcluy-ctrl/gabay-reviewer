import type { MockExamAnswer } from '../types/mockExam';

export interface PacingItem {
  question_id: string;
  question_index: number;
  subtopic: string;
  category_id: string;
  time_spent_seconds: number;
}

export interface PacingAnalysis {
  overall_avg_seconds: number;
  time_wasters: PacingItem[]; // >120s AND incorrect
  efficient_correct: PacingItem[]; // >120s AND correct
  rushed_incorrect: PacingItem[]; // <20s AND incorrect
  optimal_range_count: number; // 30-90s range
  optimal_range_pct: number;
}

export function computePacingAnalysis(answers: MockExamAnswer[]): PacingAnalysis {
  if (answers.length === 0) {
    return {
      overall_avg_seconds: 0,
      time_wasters: [],
      efficient_correct: [],
      rushed_incorrect: [],
      optimal_range_count: 0,
      optimal_range_pct: 0,
    };
  }

  let totalTime = 0;
  const timeWasters: PacingItem[] = [];
  const efficientCorrect: PacingItem[] = [];
  const rushedIncorrect: PacingItem[] = [];
  let optimalCount = 0;

  for (const a of answers) {
    const t = a.time_spent_seconds || 0;
    totalTime += t;
    const isCorrect = a.chosen_option !== null && a.chosen_option === a.content_snapshot.correct_option;

    const item: PacingItem = {
      question_id: a.question_id,
      question_index: a.question_index,
      subtopic: a.content_snapshot.subtopic,
      category_id: a.content_snapshot.category_id,
      time_spent_seconds: t,
    };

    if (t > 120 && !isCorrect) {
      timeWasters.push(item);
    } else if (t > 120 && isCorrect) {
      efficientCorrect.push(item);
    } else if (t < 20 && !isCorrect) {
      rushedIncorrect.push(item);
    }

    if (t >= 30 && t <= 90) {
      optimalCount++;
    }
  }

  const overallAvg = Math.round(totalTime / answers.length);
  const optimalPct = Number(((optimalCount / answers.length) * 100).toFixed(1));

  return {
    overall_avg_seconds: overallAvg,
    time_wasters: timeWasters,
    efficient_correct: efficientCorrect,
    rushed_incorrect: rushedIncorrect,
    optimal_range_count: optimalCount,
    optimal_range_pct: optimalPct,
  };
}
