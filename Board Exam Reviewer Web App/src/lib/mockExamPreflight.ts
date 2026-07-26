import { db } from './db';
import type { MockExamSection } from '../types/mockExam';

export interface SectionPoolStatus {
  section_id: string;
  name: string;
  needed: number;
  available: number;
  isSatisfied: boolean;
}

export interface PreflightReport {
  ok: boolean;
  examId: string;
  totalNeeded: number;
  totalAvailable: number;
  sections: SectionPoolStatus[];
}

export async function preflightExamPool(
  examId: string = 'cse-professional-v1',
  isEntitled: boolean = true
): Promise<PreflightReport> {
  const exam = await db.mock_exams.get(examId);

  if (!exam) {
    return {
      ok: false,
      examId,
      totalNeeded: 0,
      totalAvailable: 0,
      sections: [],
    };
  }

  const sections: MockExamSection[] = JSON.parse(exam.section_config);
  const allQuestions = await db.questions.toArray();
  const eligibleQuestions = isEntitled
    ? allQuestions
    : allQuestions.filter(q => q.is_free);

  let ok = true;
  let totalNeeded = 0;
  let totalAvailable = 0;
  const sectionStatuses: SectionPoolStatus[] = [];

  for (const section of sections) {
    const categories = new Set(section.category_ids);
    const available = eligibleQuestions.filter(q => categories.has(q.category_id)).length;
    const needed = section.question_count;
    const isSatisfied = available >= needed;

    if (!isSatisfied) {
      ok = false;
    }

    totalNeeded += needed;
    totalAvailable += available;

    sectionStatuses.push({
      section_id: section.section_id,
      name: section.name,
      needed,
      available,
      isSatisfied,
    });
  }

  return {
    ok,
    examId,
    totalNeeded,
    totalAvailable,
    sections: sectionStatuses,
  };
}
