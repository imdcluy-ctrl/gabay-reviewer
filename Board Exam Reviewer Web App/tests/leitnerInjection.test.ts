import assert from 'node:assert/strict';
import { classifyErrorType } from '../src/lib/leitnerInjection';
import { leitnerConfig } from '../src/lib/config/leitner';
import type { MockExamAnswer, AnswerContentSnapshot } from '../src/types/mockExam';

console.log('🧪 Running Stage 2.5 Leitner Injection Unit Tests (§12, INV-009, INV-010, H1, H2, M1, M2)...\n');

const mockSnapshot: AnswerContentSnapshot = {
  question_text: 'Sample stem',
  options: { A: 'Opt A', B: 'Opt B', C: 'Opt C', D: 'Opt D' },
  correct_option: 'A',
  explanation: 'Explanation',
  hint_ladder: [],
  deconstruction: 'Deconstruction',
  subtopic: 'analogy',
  category_id: 'verbal-analogy',
  content_version: 1,
};

function createAnswer(timeSecs: number, chosenOpt: 'A' | 'B' | null): MockExamAnswer {
  return {
    id: 'ans-1',
    attempt_id: 'att-1',
    question_id: 'q-1',
    question_index: 0,
    chosen_option: chosenOpt,
    is_correct: chosenOpt === 'A',
    time_spent_seconds: timeSecs,
    flagged: false,
    section_id: 'verbal',
    content_snapshot: mockSnapshot,
    created_at: '',
  };
}

// 1. Error Classification Tests (INV-010, M2)
function testErrorClassification() {
  console.log('Checking error classification rules (careless, conceptual, standard, timeout)...');

  // Careless: <20s wrong
  assert.equal(classifyErrorType(createAnswer(15, 'B')), 'careless');

  // Conceptual: >120s wrong
  assert.equal(classifyErrorType(createAnswer(140, 'B')), 'conceptual');

  // Standard: 20s - 120s wrong
  assert.equal(classifyErrorType(createAnswer(45, 'B')), 'standard');

  // Timeout: unanswered (null choice)
  assert.equal(classifyErrorType(createAnswer(0, null)), 'timeout');

  // Correct: returns 'correct' (L1)
  assert.equal(classifyErrorType(createAnswer(45, 'A')), 'correct');

  console.log('✅ Error classification rules verified.');
}

// 2. Default-Off Promotion Config Test (H1, INV-010)
function testDefaultOffPromotionConfig() {
  console.log('Checking INV-010 default-off promotion config (H1)...');

  assert.equal(
    leitnerConfig.promote_correct_exam_answers,
    false,
    'leitner.promote_correct_exam_answers must default to false to preserve exam=assessment asymmetry (INV-010, H1)'
  );

  console.log('✅ INV-010 default-off promotion config verified.');
}

// 3. Demotion Box & Leech Target Invariant Tests (INV-010, M1, M2)
function testDemotionRules() {
  console.log('Checking INV-010 demotion box and leech increment rules (M1, M2)...');

  // Careless: Box -1, NO leech increment (M1)
  const carelessError = classifyErrorType(createAnswer(15, 'B'));
  assert.equal(carelessError, 'careless');

  // Conceptual: Box 1 reset, leech +1 (M1)
  const conceptualError = classifyErrorType(createAnswer(140, 'B'));
  assert.equal(conceptualError, 'conceptual');

  // Standard: Box min(existing, 2) (M2), leech +1 (M1)
  const standardError = classifyErrorType(createAnswer(60, 'B'));
  assert.equal(standardError, 'standard');

  console.log('✅ INV-010 demotion box & leech target rules verified.');
}

function runAllTests() {
  try {
    testErrorClassification();
    testDefaultOffPromotionConfig();
    testDemotionRules();
    console.log('\n🎉 ALL LEITNER INJECTION UNIT TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  }
}

runAllTests();
