import assert from 'node:assert/strict';
import { normalizeAnswer, mapMockExamAnswers, mapPracticeAttempts } from '../src/lib/deepAnalytics/mappers';
import { CONTENT_HEALTH_CONFIG } from '../src/lib/deepAnalytics/config';
import type { LocalQuestion, LocalAttempt } from '../src/lib/db';
import type { MockExamAnswer } from '../src/types/mockExam';

console.log('🧪 Running Deep Analytics Pipeline Unit Tests (Phase 5.5)...\n');

function testNormalizeAnswer() {
  console.log('Checking normalizeAnswer string contract...');
  assert.equal(normalizeAnswer(' a '), 'A');
  assert.equal(normalizeAnswer('b'), 'B');
  assert.equal(normalizeAnswer(''), '');
  assert.equal(normalizeAnswer(null as any), '');
  console.log('✅ normalizeAnswer string contract verified.');
}

function testSkipAndCountOrphans() {
  console.log('Checking skip-and-count orphan strategy in mappers...');

  const qMap = new Map<string, LocalQuestion>([
    [
      'q-1',
      {
        id: 'q-1',
        category_id: 'numerical-ability',
        subtopic: 'Ratio & Proportion',
        difficulty: 1,
        is_free: true,
        question_text: 'Q1',
        options: [],
        correct_option: 'A',
        hint_ladder: [],
        deconstruct_text: '',
        choice_explanations: {},
        next_time_rule: '',
        blueprint_id: 'b-1',
        status: 'active',
      },
    ],
  ]);

  const attempts: LocalAttempt[] = [
    {
      id: 'att-1',
      local_user_id: 'u-1',
      question_id: 'q-1', // valid
      chosen_option: 'a',
      is_correct: true,
      confidence_rating: 3,
      hints_used_count: 0,
      time_spent_seconds: 25,
      session_type: 'practice',
      attempted_at: new Date().toISOString(),
      synced_at: null,
    },
    {
      id: 'att-2',
      local_user_id: 'u-1',
      question_id: 'q-orphaned-999', // missing/orphaned
      chosen_option: 'b',
      is_correct: false,
      confidence_rating: 1,
      hints_used_count: 0,
      time_spent_seconds: 15,
      session_type: 'practice',
      attempted_at: new Date().toISOString(),
      synced_at: null,
    },
  ];

  const res = mapPracticeAttempts(attempts, qMap);
  assert.equal(res.unifiedAnswers.length, 1, 'Should map exactly 1 valid attempt');
  assert.equal(res.orphanedCount, 1, 'Should count 1 orphaned attempt');
  assert.equal(res.unifiedAnswers[0].isCorrect, true, 'Normalized comparison of "a" vs "A" should be true');

  console.log('✅ Skip-and-count orphan strategy verified.');
}

function testContentHealthConfigBoundaries() {
  console.log('Checking CONTENT_HEALTH_CONFIG threshold constants...');
  assert.equal(CONTENT_HEALTH_CONFIG.BAD_QUESTION_FAIL_RATE, 0.7);
  assert.equal(CONTENT_HEALTH_CONFIG.BAD_QUESTION_MIN_ATTEMPTS, 5);
  assert.equal(CONTENT_HEALTH_CONFIG.HARD_TOPIC_FAIL_RATE, 0.5);
  assert.equal(CONTENT_HEALTH_CONFIG.HARD_TOPIC_MIN_ATTEMPTS, 10);
  console.log('✅ CONTENT_HEALTH_CONFIG threshold constants verified.');
}

function runAllTests() {
  try {
    testNormalizeAnswer();
    testSkipAndCountOrphans();
    testContentHealthConfigBoundaries();
    console.log('\n🎉 ALL DEEP ANALYTICS PIPELINE UNIT TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  }
}

runAllTests();
