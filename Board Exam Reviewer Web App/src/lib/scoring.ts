import type { MockExamAnswer, MockExamSection } from '../types/mockExam';

export interface ScoreSummary {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  percentage: number;
  passed: boolean;
  passingThreshold: number;
  examType: 'professional' | 'subprofessional';
}

export interface SectionScore {
  section_id: string;
  section_name: string;
  total: number;
  correct: number;
  percentage: number;
  time_spent_seconds: number;
  avg_seconds_per_question: number;
}

export interface SubtopicDiagnostic {
  subtopic: string;
  category_id: string;
  total: number;
  correct: number;
  accuracy_ratio: number; // 0.0 to 1.0
  is_weak: boolean; // true if accuracy < 0.60
}

export function calculateExamScore(
  answers: MockExamAnswer[],
  examType: 'professional' | 'subprofessional' = 'professional'
): ScoreSummary {
  // INV-019: Calculate exclusively from immutable content_snapshot
  let correctCount = 0;
  const totalQuestions = answers.length;

  for (const ans of answers) {
    if (ans.chosen_option && ans.chosen_option === ans.content_snapshot.correct_option) {
      correctCount++;
    }
  }

  // Official CSC 80% passing threshold (INV-008: 136/170 Pro, 132/165 SubPro)
  const passingThreshold = examType === 'subprofessional' ? 132 : 136;
  const percentage = totalQuestions > 0 ? Number(((correctCount / totalQuestions) * 100).toFixed(2)) : 0;
  const passed = correctCount >= passingThreshold;

  return {
    totalQuestions,
    correctAnswers: correctCount,
    score: correctCount,
    percentage,
    passed,
    passingThreshold,
    examType,
  };
}

export function generateSectionScores(
  answers: MockExamAnswer[],
  sections: MockExamSection[]
): SectionScore[] {
  return sections.map(sec => {
    const categorySet = new Set(sec.category_ids);
    const sectionAnswers = answers.filter(a => categorySet.has(a.content_snapshot.category_id));

    let correct = 0;
    let timeSpent = 0;

    for (const a of sectionAnswers) {
      if (a.chosen_option && a.chosen_option === a.content_snapshot.correct_option) {
        correct++;
      }
      timeSpent += a.time_spent_seconds || 0; // L3 wall-time attribution to currently viewed question's section
    }

    const total = sectionAnswers.length;
    const percentage = total > 0 ? Number(((correct / total) * 100).toFixed(2)) : 0;
    const avgSecs = total > 0 ? Math.round(timeSpent / total) : 0;

    return {
      section_id: sec.section_id,
      section_name: sec.name,
      total,
      correct,
      percentage,
      time_spent_seconds: timeSpent,
      avg_seconds_per_question: avgSecs,
    };
  });
}

export function generateSubtopicDiagnostics(answers: MockExamAnswer[]): SubtopicDiagnostic[] {
  const subtopicMap = new Map<string, { category_id: string; total: number; correct: number }>();

  for (const a of answers) {
    const key = a.content_snapshot.subtopic;
    const existing = subtopicMap.get(key) || {
      category_id: a.content_snapshot.category_id,
      total: 0,
      correct: 0,
    };

    existing.total++;
    if (a.chosen_option && a.chosen_option === a.content_snapshot.correct_option) {
      existing.correct++;
    }

    subtopicMap.set(key, existing);
  }

  const result: SubtopicDiagnostic[] = [];
  subtopicMap.forEach((val, key) => {
    const ratio = val.total > 0 ? Number((val.correct / val.total).toFixed(2)) : 0;
    result.push({
      subtopic: key,
      category_id: val.category_id,
      total: val.total,
      correct: val.correct,
      accuracy_ratio: ratio,
      is_weak: ratio < 0.6, // Weak subtopic threshold < 60%
    });
  });

  return result.sort((a, b) => a.accuracy_ratio - b.accuracy_ratio);
}
