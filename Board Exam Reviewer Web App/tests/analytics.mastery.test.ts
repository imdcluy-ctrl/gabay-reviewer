import assert from 'node:assert/strict';
import { computeSubtopicMastery } from '../src/lib/deepAnalytics/mastery';
import type { MockExamAnswer } from '../src/types/mockExam';

console.log('🧪 Running Stage 3.3 Subtopic Mastery Unit Tests (INV-028b, INV-028c)...\n');

function createMockAnswer(id: string, sectionId: string, subtopic: string, isCorrect: boolean): MockExamAnswer {
  return {
    id,
    attempt_id: 'att-1',
    question_id: `q-${id}`,
    question_index: 0,
    chosen_option: 'A',
    is_correct: isCorrect,
    time_spent_seconds: 30,
    flagged: false,
    section_id: sectionId,
    content_snapshot: {
      question_text: 'Test question',
      options: ['A', 'B', 'C', 'D'],
      correct_option: 'A',
      explanation: 'Explanation',
      category_id: sectionId,
      subtopic,
    },
    created_at: new Date().toISOString(),
  };
}

function testInsufficientDataHandling() {
  console.log('Checking insufficient_data heat bin for <3 answered items (INV-028b)...');

  const answers: MockExamAnswer[] = [
    createMockAnswer('1', 'numerical-ability', 'Ratio & Proportion', true),
    createMockAnswer('2', 'numerical-ability', 'Ratio & Proportion', true), // Only 2 items
  ];

  const mastery = computeSubtopicMastery(answers.map(a => ({
    questionId: a.question_id,
    subjectArea: a.section_id || a.content_snapshot?.category_id || '',
    subtopic: a.content_snapshot?.subtopic || '',
    selectedAnswer: a.chosen_option,
    correctAnswer: a.content_snapshot?.correct_option || 'A',
    isCorrect: a.is_correct,
    answeredAt: a.created_at,
    source: 'mock_exam',
    timeSpentMs: a.time_spent_seconds * 1000,
    examId: a.attempt_id
  })));
  assert.equal(mastery.length, 1);
  assert.equal(mastery[0].subtopic, 'Ratio & Proportion');
  assert.equal(mastery[0].totalAnswered, 2);
  assert.equal(mastery[0].heatBin, 'insufficient_data', 'Should mark as insufficient_data when total < 3');

  console.log('✅ INV-028b insufficient_data handling verified.');
}

function testHeatBins() {
  console.log('Checking heatBin categorization (low, mid, high)...');

  const answers: MockExamAnswer[] = [
    // Low: 1/4 = 25% (<50%)
    createMockAnswer('1', 'verbal-ability', 'Vocabulary', true),
    createMockAnswer('2', 'verbal-ability', 'Vocabulary', false),
    createMockAnswer('3', 'verbal-ability', 'Vocabulary', false),
    createMockAnswer('4', 'verbal-ability', 'Vocabulary', false),

    // Mid: 2/3 = 66.7% (50-79%)
    createMockAnswer('5', 'analytical-ability', 'Logic', true),
    createMockAnswer('6', 'analytical-ability', 'Logic', true),
    createMockAnswer('7', 'analytical-ability', 'Logic', false),

    // High: 3/3 = 100% (>=80%)
    createMockAnswer('8', 'general-information', 'Philippine Constitution', true),
    createMockAnswer('9', 'general-information', 'Philippine Constitution', true),
    createMockAnswer('10', 'general-information', 'Philippine Constitution', true),
  ];

  const mastery = computeSubtopicMastery(answers.map(a => ({
    questionId: a.question_id,
    subjectArea: a.section_id || a.content_snapshot?.category_id || '',
    subtopic: a.content_snapshot?.subtopic || '',
    selectedAnswer: a.chosen_option,
    correctAnswer: a.content_snapshot?.correct_option || 'A',
    isCorrect: a.is_correct,
    answeredAt: a.created_at,
    source: 'mock_exam',
    timeSpentMs: a.time_spent_seconds * 1000,
    examId: a.attempt_id
  })));
  assert.equal(mastery.length, 3);

  const vocab = mastery.find(m => m.subtopic === 'Vocabulary');
  assert.equal(vocab?.heatBin, 'low', '25% accuracy should be low');

  const logic = mastery.find(m => m.subtopic === 'Logic');
  assert.equal(logic?.heatBin, 'mid', '66.7% accuracy should be mid');

  const consti = mastery.find(m => m.subtopic === 'Philippine Constitution');
  assert.equal(consti?.heatBin, 'high', '100% accuracy should be high');

  console.log('✅ INV-028c heatBin categorization verified.');
}

function runAllTests() {
  try {
    testInsufficientDataHandling();
    testHeatBins();
    console.log('\n🎉 ALL STAGE 3.3 SUBTOPIC MASTERY UNIT TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  }
}

runAllTests();
