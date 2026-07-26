import assert from 'node:assert/strict';
import { computePacingAnalysis } from '../src/lib/pacing';
import type { MockExamAnswer, AnswerContentSnapshot } from '../src/types/mockExam';

console.log('🧪 Running Stage 2.4 Pacing Analysis Unit Tests (§12, H1)...\n');

const mockSnapshot: AnswerContentSnapshot = {
  question_text: 'Sample stem',
  options: { A: 'Opt A', B: 'Opt B', C: 'Opt C', D: 'Opt D' },
  correct_option: 'A',
  explanation: 'Explanation',
  hint_ladder: [],
  deconstruction: 'Deconstruction',
  subtopic: 'algebra',
  category_id: 'numerical-ability',
  content_version: 1,
};

function testPacingCategorization() {
  console.log('Checking pacing categorization (time_wasters, rushed_incorrect, optimal_range)...');

  const mockAnswers: MockExamAnswer[] = [
    // 1. Time Waster: >120s & incorrect
    {
      id: 'ans-1', attempt_id: 'att-1', question_id: 'q-1', question_index: 0,
      chosen_option: 'B', is_correct: false, time_spent_seconds: 140, flagged: false,
      section_id: 'numerical', content_snapshot: mockSnapshot, created_at: '',
    },
    // 2. Rushed Incorrect: <20s & incorrect
    {
      id: 'ans-2', attempt_id: 'att-1', question_id: 'q-2', question_index: 1,
      chosen_option: 'B', is_correct: false, time_spent_seconds: 12, flagged: false,
      section_id: 'numerical', content_snapshot: mockSnapshot, created_at: '',
    },
    // 3. Optimal Range: 45s (30-90s) & correct
    {
      id: 'ans-3', attempt_id: 'att-1', question_id: 'q-3', question_index: 2,
      chosen_option: 'A', is_correct: true, time_spent_seconds: 45, flagged: false,
      section_id: 'numerical', content_snapshot: mockSnapshot, created_at: '',
    },
    // 4. Efficient Correct: >120s & correct
    {
      id: 'ans-4', attempt_id: 'att-1', question_id: 'q-4', question_index: 3,
      chosen_option: 'A', is_correct: true, time_spent_seconds: 130, flagged: false,
      section_id: 'numerical', content_snapshot: mockSnapshot, created_at: '',
    },
  ];

  const analysis = computePacingAnalysis(mockAnswers);

  assert.equal(analysis.time_wasters.length, 1);
  assert.equal(analysis.time_wasters[0].question_id, 'q-1');

  assert.equal(analysis.rushed_incorrect.length, 1);
  assert.equal(analysis.rushed_incorrect[0].question_id, 'q-2');

  assert.equal(analysis.efficient_correct.length, 1);
  assert.equal(analysis.efficient_correct[0].question_id, 'q-4');

  assert.equal(analysis.optimal_range_count, 1);
  assert.equal(analysis.optimal_range_pct, 25.0);

  console.log('✅ Pacing categorization verified.');
}

function runAllTests() {
  try {
    testPacingCategorization();
    console.log('\n🎉 ALL PACING ANALYSIS UNIT TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  }
}

runAllTests();
