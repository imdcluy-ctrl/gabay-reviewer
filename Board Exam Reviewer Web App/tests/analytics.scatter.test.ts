import assert from 'node:assert/strict';
import { computeSpeedAccuracyScatter } from '../src/lib/deepAnalytics/scatter';
import type { MockExamAttempt, MockExamAnswer } from '../src/types/mockExam';

console.log('🧪 Running Stage 3.3 Speed vs Accuracy Scatter Unit Tests (INV-028d)...\n');

function testScatterCalculation() {
  console.log('Checking median time and accuracy calculation for scatter points...');

  const attempt: MockExamAttempt = {
    id: 'att-101',
    local_user_id: 'u-1',
    mock_exam_id: 'full-simulation',
    started_at: '2026-07-19T10:00:00Z',
    completed_at: '2026-07-19T13:00:00Z',
    score: 3,
    percentage: 75,
    passed: false,
    status: 'completed',
    mode: 'simulation',
    integrity_flag: 'clean',
    time_remaining_seconds: 0,
    current_question_index: 4,
    section_times: {},
  };

  const answers: MockExamAnswer[] = [
    { id: '1', attempt_id: 'att-101', question_id: 'q-1', question_index: 0, chosen_option: 'A', is_correct: true, time_spent_seconds: 10, flagged: false, section_id: 'sec-1', created_at: '' },
    { id: '2', attempt_id: 'att-101', question_id: 'q-2', question_index: 1, chosen_option: 'A', is_correct: true, time_spent_seconds: 30, flagged: false, section_id: 'sec-1', created_at: '' },
    { id: '3', attempt_id: 'att-101', question_id: 'q-3', question_index: 2, chosen_option: 'A', is_correct: true, time_spent_seconds: 50, flagged: false, section_id: 'sec-1', created_at: '' },
    { id: '4', attempt_id: 'att-101', question_id: 'q-4', question_index: 3, chosen_option: 'B', is_correct: false, time_spent_seconds: 150, flagged: false, section_id: 'sec-1', created_at: '' },
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

  const points = computeSpeedAccuracyScatter(unifiedAnswers);
  assert.equal(points.length, 1);
  assert.equal(points[0].attemptId, 'att-101');
  assert.equal(points[0].accuracy, 0.75, '3/4 correct = 0.75');
  assert.equal(points[0].medianTimeSpentSeconds, 40, 'Median of [10, 30, 50, 150] is (30+50)/2 = 40');

  console.log('✅ INV-028d scatter point calculation verified.');
}

function runAllTests() {
  try {
    testScatterCalculation();
    console.log('\n🎉 ALL STAGE 3.3 SPEED VS ACCURACY UNIT TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  }
}

runAllTests();
