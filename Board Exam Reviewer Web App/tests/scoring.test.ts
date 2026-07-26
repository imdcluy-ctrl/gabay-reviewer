import assert from 'node:assert/strict';
import { calculateExamScore } from '../src/lib/scoring';
import type { MockExamAnswer, AnswerContentSnapshot } from '../src/types/mockExam';

console.log('🧪 Running Stage 2.4 Scoring & Appendix B Boundary Tests (§12, INV-008, INV-019, M1)...\n');

const mockSnapshot: AnswerContentSnapshot = {
  question_text: 'Sample stem',
  options: { A: 'Opt A', B: 'Opt B', C: 'Opt C', D: 'Opt D' },
  correct_option: 'A',
  explanation: 'Sample explanation',
  hint_ladder: [],
  deconstruction: 'Sample deconstruction',
  subtopic: 'arithmetic',
  category_id: 'numerical-ability',
  content_version: 1,
};

function createMockAnswers(total: number, correct: number): MockExamAnswer[] {
  const answers: MockExamAnswer[] = [];
  for (let i = 0; i < total; i++) {
    const isCorr = i < correct;
    answers.push({
      id: `ans-${i}`,
      attempt_id: 'att-test',
      question_id: `q-${i}`,
      question_index: i,
      chosen_option: isCorr ? 'A' : 'B',
      is_correct: isCorr,
      time_spent_seconds: 45,
      flagged: false,
      section_id: 'numerical',
      content_snapshot: mockSnapshot, // Sourced exclusively from snapshot (INV-019)
      created_at: new Date().toISOString(),
    });
  }
  return answers;
}

// M1: 8 Appendix B Boundary Fixture Assertions
function testAppendixBFixtures() {
  console.log('Testing Appendix B boundary fixtures (INV-008, M1)...');

  // 1. Perfect Professional
  const f1 = calculateExamScore(createMockAnswers(170, 170), 'professional');
  assert.equal(f1.percentage, 100);
  assert.equal(f1.passed, true);

  // 2. Borderline Pass Professional (136/170 = 80%)
  const f2 = calculateExamScore(createMockAnswers(170, 136), 'professional');
  assert.equal(f2.percentage, 80);
  assert.equal(f2.passed, true);

  // 3. Borderline Fail Professional (135/170 = 79.41%)
  const f3 = calculateExamScore(createMockAnswers(170, 135), 'professional');
  assert.equal(f3.percentage, 79.41);
  assert.equal(f3.passed, false);

  // 4. Perfect Sub-Professional
  const f4 = calculateExamScore(createMockAnswers(165, 165), 'subprofessional');
  assert.equal(f4.percentage, 100);
  assert.equal(f4.passed, true);

  // 5. Borderline Pass Sub-Professional (132/165 = 80%)
  const f5 = calculateExamScore(createMockAnswers(165, 132), 'subprofessional');
  assert.equal(f5.percentage, 80);
  assert.equal(f5.passed, true);

  // 6. Borderline Fail Sub-Professional (131/165 = 79.39%)
  const f6 = calculateExamScore(createMockAnswers(165, 131), 'subprofessional');
  assert.equal(f6.percentage, 79.39);
  assert.equal(f6.passed, false);

  // 7. All Unanswered Professional
  const f7 = calculateExamScore(createMockAnswers(170, 0), 'professional');
  assert.equal(f7.percentage, 0);
  assert.equal(f7.passed, false);

  // 8. Zero Correct
  const f8 = calculateExamScore(createMockAnswers(100, 0), 'professional');
  assert.equal(f8.percentage, 0);
  assert.equal(f8.passed, false);

  console.log('✅ All 8 Appendix B boundary fixtures passed.');
}

// M1: Snapshot Isolation Invariant Test (INV-019)
function testSnapshotIsolation() {
  console.log('Testing snapshot isolation invariant (INV-019)...');

  const answers = createMockAnswers(10, 8);
  const scoreBefore = calculateExamScore(answers, 'professional');

  // Mutate snapshot's correct option
  answers[0].content_snapshot.correct_option = 'B';
  const scoreAfter = calculateExamScore(answers, 'professional');

  // Scoring changes only when snapshot changes, demonstrating it reads exclusively from snapshot
  assert.notEqual(scoreBefore.score, scoreAfter.score);
  console.log('✅ Snapshot isolation verified.');
}

function runAllTests() {
  try {
    testAppendixBFixtures();
    testSnapshotIsolation();
    console.log('\n🎉 ALL SCORING & APPENDIX B UNIT TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  }
}

runAllTests();
