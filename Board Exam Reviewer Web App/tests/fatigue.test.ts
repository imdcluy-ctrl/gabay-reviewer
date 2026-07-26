import assert from 'node:assert/strict';
import { calculateFatigueMetrics } from '../src/lib/fatigue';
import type { MockExamAnswer, AnswerContentSnapshot } from '../src/types/mockExam';

console.log('🧪 Running Stage 2.4 Cognitive Fatigue Unit Tests (§12, INV-023)...\n');

const mockSnapshot: AnswerContentSnapshot = {
  question_text: 'Sample stem',
  options: { A: 'Opt A', B: 'Opt B', C: 'Opt C', D: 'Opt D' },
  correct_option: 'A',
  explanation: 'Explanation',
  hint_ladder: [],
  deconstruction: 'Deconstruction',
  subtopic: 'vocabulary',
  category_id: 'verbal-ability',
  content_version: 1,
};

function createQuartileAnswers(q1Acc: number, q4Acc: number): MockExamAnswer[] {
  const answers: MockExamAnswer[] = [];
  // 40 items total (10 per quartile)
  for (let i = 0; i < 40; i++) {
    let isCorr = false;
    if (i < 10) {
      isCorr = i < Math.round(q1Acc * 10); // Q1
    } else if (i < 30) {
      isCorr = true; // Q2 & Q3
    } else {
      isCorr = (i - 30) < Math.round(q4Acc * 10); // Q4
    }

    answers.push({
      id: `ans-${i}`,
      attempt_id: 'att-1',
      question_id: `q-${i}`,
      question_index: i,
      chosen_option: isCorr ? 'A' : 'B',
      is_correct: isCorr,
      time_spent_seconds: 40,
      flagged: false,
      section_id: 'verbal',
      content_snapshot: mockSnapshot,
      created_at: '',
    });
  }
  return answers;
}

function testFatigueThresholdTrigger() {
  console.log('Checking INV-023 fatigue threshold trigger (>= 15pp drop)...');

  // Case 1: Q1 = 90% (0.9), Q4 = 70% (0.7) -> Delta = 20pp (0.20) >= 15pp -> trigger
  const fatigueCase1 = calculateFatigueMetrics(createQuartileAnswers(0.9, 0.7));
  assert.equal(fatigueCase1.hasFatigueDeficit, true);
  assert.equal(fatigueCase1.fatigueDelta, 0.20);
  assert.ok(fatigueCase1.recommendation.includes('Cognitive Stamina Warning'));

  // Case 2: Q1 = 80% (8/10), Q4 = 70% (7/10) -> Delta = 10pp (0.10) < 15pp -> no trigger
  const fatigueCase2 = calculateFatigueMetrics(createQuartileAnswers(0.8, 0.7));
  assert.equal(fatigueCase2.hasFatigueDeficit, false);
  assert.equal(fatigueCase2.fatigueDelta, 0.10);

  console.log('✅ INV-023 fatigue threshold trigger verified.');
}

function runAllTests() {
  try {
    testFatigueThresholdTrigger();
    console.log('\n🎉 ALL COGNITIVE FATIGUE UNIT TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  }
}

runAllTests();
