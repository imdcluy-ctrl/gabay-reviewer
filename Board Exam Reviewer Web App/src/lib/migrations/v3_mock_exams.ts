import type { MockExam } from '../../types/mockExam';

export async function seedDefaultMockExams(dbOrTx: any): Promise<void> {
  const now = new Date().toISOString();

  const defaultExams: MockExam[] = [
    {
      id: 'cse-professional-v1',
      exam_type: 'professional',
      title: 'CSE-PPT Professional Simulated Exam',
      total_questions: 170,
      time_limit_minutes: 190, // GLOBAL single timer
      section_config: JSON.stringify([
        {
          section_id: 'verbal',
          name: 'Verbal Ability',
          question_count: 60,
          advisory_time_minutes: 60,
          category_ids: ['verbal-ability', 'grammar-correct-usage', 'vocabulary-synonyms', 'reading-comprehension', 'verbal-analogies', 'sentence-completion'],
        },
        {
          section_id: 'analytical',
          name: 'Analytical Ability',
          question_count: 40,
          advisory_time_minutes: 45,
          category_ids: ['analytical-ability', 'logical-reasoning', 'data-interpretation', 'pattern-recognition', 'sequence-series'],
        },
        {
          section_id: 'numerical',
          name: 'Numerical Ability',
          question_count: 40,
          advisory_time_minutes: 45,
          category_ids: ['numerical-ability', 'ratio-proportion', 'percentage-interest', 'word-problems-algebra', 'number-series', 'basic-operations'],
        },
        {
          section_id: 'general',
          name: 'General Information',
          question_count: 30,
          advisory_time_minutes: 40,
          category_ids: ['general-information', 'philippine-constitution', 'ra-6713-code-of-conduct', 'philippine-government', 'current-events-environment', 'peace-human-rights'],
        },
      ]),
      status: 'active',
      version: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'cse-subprofessional-v1',
      exam_type: 'subprofessional',
      title: 'CSE-PPT Sub-Professional Simulated Exam',
      total_questions: 165,
      time_limit_minutes: 168, // GLOBAL single timer
      section_config: JSON.stringify([
        {
          section_id: 'verbal',
          name: 'Verbal Ability',
          question_count: 60,
          advisory_time_minutes: 55,
          category_ids: ['verbal-ability', 'grammar-correct-usage', 'vocabulary-synonyms', 'reading-comprehension', 'verbal-analogies', 'sentence-completion'],
        },
        {
          section_id: 'clerical',
          name: 'Clerical Ability',
          question_count: 35,
          advisory_time_minutes: 35,
          category_ids: ['clerical-ability', 'alphabetical-filing', 'coding-spelling', 'clerical-operations', 'typing-speed-accuracy'],
        },
        {
          section_id: 'numerical',
          name: 'Numerical Ability',
          question_count: 40,
          advisory_time_minutes: 40,
          category_ids: ['numerical-ability', 'ratio-proportion', 'percentage-interest', 'word-problems-algebra', 'number-series', 'basic-operations'],
        },
        {
          section_id: 'general',
          name: 'General Information',
          question_count: 30,
          advisory_time_minutes: 38,
          category_ids: ['general-information', 'philippine-constitution', 'ra-6713-code-of-conduct', 'philippine-government', 'current-events-environment', 'peace-human-rights'],
        },
      ]),
      status: 'active',
      version: 1,
      created_at: now,
      updated_at: now,
    },
  ];

  if (dbOrTx.mock_exams) {
    await dbOrTx.mock_exams.bulkPut(defaultExams);
  } else if (dbOrTx.table) {
    await dbOrTx.table('mock_exams').bulkPut(defaultExams);
  }
}
