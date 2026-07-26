import assert from 'node:assert/strict';
import {
  FREE_TIER_LIMITS,
  filterQuestionsForUser,
} from '../src/lib/entitlements';
import type { LocalQuestion } from '../src/lib/db';

console.log('🧪 Running Stage 3.4 Entitlements & Paywall Engine Unit Tests (INV-029)...\n');

function testFreeTierLimitsConstants() {
  console.log('Checking FREE_TIER_LIMITS constants (INV-029a)...');

  assert.equal(FREE_TIER_LIMITS.MAX_SIMULATION_ATTEMPTS, 1, 'Free simulation max attempt limit must be 1');
  assert.equal(FREE_TIER_LIMITS.MAX_DAILY_PRACTICE_SESSIONS, 3, 'Free daily practice limit must be 3');

  console.log('✅ FREE_TIER_LIMITS constants verified.');
}

function testQuestionBankGating() {
  console.log('Checking filterQuestionsForUser gating (INV-029a/b)...');

  const mockQuestions: LocalQuestion[] = [
    { id: 'q1', category_id: 'verbal-ability', subtopic: '', question_text: 'Q1', options: [], correct_option: 'A', explanation: '', difficulty: 'medium', is_free: true, status: 'active' },
    { id: 'q2', category_id: 'verbal-ability', subtopic: '', question_text: 'Q2', options: [], correct_option: 'A', explanation: '', difficulty: 'hard', is_free: false, status: 'active' },
    { id: 'q3', category_id: 'verbal-ability', subtopic: '', question_text: 'Q3', options: [], correct_option: 'A', explanation: '', difficulty: 'easy', is_free: undefined, status: 'active' },
  ];

  // Free user gets only is_free: true or undefined
  const freePool = filterQuestionsForUser(mockQuestions, false);
  assert.equal(freePool.length, 2, 'Free user should receive only 2 questions (q1, q3)');
  assert.ok(freePool.some(q => q.id === 'q1'));
  assert.ok(freePool.some(q => q.id === 'q3'));
  assert.ok(!freePool.some(q => q.id === 'q2'), 'q2 (is_free: false) should be locked for free user');

  // Premium user gets 100% of question bank
  const proPool = filterQuestionsForUser(mockQuestions, true);
  assert.equal(proPool.length, 3, 'Premium user should receive 100% of question bank (3 questions)');

  console.log('✅ Question bank gating verified.');
}

function runAllTests() {
  try {
    testFreeTierLimitsConstants();
    testQuestionBankGating();
    console.log('\n🎉 ALL STAGE 3.4 ENTITLEMENTS UNIT TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  }
}

runAllTests();
