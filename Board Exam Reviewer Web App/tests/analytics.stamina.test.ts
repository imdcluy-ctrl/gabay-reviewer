import assert from 'node:assert/strict';
import { computeStaminaProgression } from '../src/lib/deepAnalytics/stamina';
import type { MockExamAttempt, MockExamAnswer } from '../src/types/mockExam';

console.log('🧪 Running Stage 3.3 Stamina Progression Unit Tests (INV-028e, INV-023)...\n');

function testStaminaProgressionCalculation() {
  console.log('Checking Q1-Q4 stamina progression calculation and INV-023 fatigue warning flag...');

  const attempt: MockExamAttempt = {
    id: 'att-201',
    local_user_id: 'u-1',
    mock_exam_id: 'full-simulation',
    started_at: '2026-07-19T10:00:00Z',
    completed_at: '2026-07-19T13:00:00Z',
    score: 2,
    percentage: 50,
    passed: false,
    status: 'completed',
    mode: 'simulation',
    integrity_flag: 'clean',
    time_remaining_seconds: 0,
    current_question_index: 4,
    section_times: {},
  };

  // Q1 correct, Q4 wrong (100% -> 0% drop = 100pp drop >= 15pp)
  const answers: MockExamAnswer[] = [
    { id: '1', attempt_id: 'att-201', question_id: 'q-1', question_index: 0, chosen_option: 'A', is_correct: true, time_spent_seconds: 30, flagged: false, section_id: 'sec-1', content_snapshot: { question_text: '', options: [], correct_option: 'A', explanation: '', category_id: 'sec-1', subtopic: '' }, created_at: '' },
    { id: '2', attempt_id: 'att-201', question_id: 'q-2', question_index: 1, chosen_option: 'A', is_correct: true, time_spent_seconds: 30, flagged: false, section_id: 'sec-1', content_snapshot: { question_text: '', options: [], correct_option: 'A', explanation: '', category_id: 'sec-1', subtopic: '' }, created_at: '' },
    { id: '3', attempt_id: 'att-201', question_id: 'q-3', question_index: 2, chosen_option: 'B', is_correct: false, time_spent_seconds: 30, flagged: false, section_id: 'sec-1', content_snapshot: { question_text: '', options: [], correct_option: 'A', explanation: '', category_id: 'sec-1', subtopic: '' }, created_at: '' },
    { id: '4', attempt_id: 'att-201', question_id: 'q-4', question_index: 3, chosen_option: 'B', is_correct: false, time_spent_seconds: 30, flagged: false, section_id: 'sec-1', content_snapshot: { question_text: '', options: [], correct_option: 'A', explanation: '', category_id: 'sec-1', subtopic: '' }, created_at: '' },
  ];

  const unifiedAnswers = answers.map(a => ({
    questionId: a.question_id,
    subjectArea: a.section_id,
    subtopic: 'general',
    selectedAnswer: a.chosen_option,
    correctAnswer: 'A',
    isCorrect: a.is_correct,
    answeredAt: attempt.started_at,
    source: 'mock_exam' as const,
    timeSpentMs: a.time_spent_seconds * 1000,
    examId: a.attempt_id
  }));

  const points = computeStaminaProgression(unifiedAnswers);
  assert.equal(points.length, 1);
  assert.equal(points[0].q1Accuracy, 1.0);
  assert.equal(points[0].q4Accuracy, 0.0);
  assert.equal(points[0].hasFatigueWarning, true, 'Should flag INV-023 fatigue warning for 100pp drop');

  console.log('✅ INV-028e stamina progression & INV-023 fatigue warning verified.');
}

function runAllTests() {
  try {
    testStaminaProgressionCalculation();
    console.log('\n🎉 ALL STAGE 3.3 STAMINA PROGRESSION UNIT TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  }
}

runAllTests();
