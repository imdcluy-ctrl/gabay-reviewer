import assert from 'node:assert/strict';
import { filterAttemptsByWindow } from '../src/lib/deepAnalytics/windows';
import type { MockExamAttempt } from '../src/types/mockExam';

console.log('🧪 Running Stage 3.3 Analytics Window Filtering Unit Tests (INV-028g)...\n');

function createAttempt(id: string, dateStr: string, status: 'completed' | 'in_progress' = 'completed'): MockExamAttempt {
  return {
    id,
    local_user_id: 'u-1',
    mock_exam_id: 'full-simulation',
    started_at: dateStr,
    completed_at: dateStr,
    score: 100,
    percentage: 80,
    passed: true,
    status,
    mode: 'simulation',
    integrity_flag: 'clean',
    time_remaining_seconds: 0,
    current_question_index: 0,
    section_times: {},
  };
}

function testLast30MocksWindow() {
  console.log('Checking last_30_mocks filter...');

  const attempts: MockExamAttempt[] = [];
  for (let i = 1; i <= 45; i++) {
    attempts.push(createAttempt(`att-${i}`, new Date(Date.now() - (45 - i) * 86400000).toISOString()));
  }

  const filtered = filterAttemptsByWindow(attempts, 'last_30_mocks');
  assert.equal(filtered.length, 30, 'Should cap at 30 completed mocks');
  assert.equal(filtered[filtered.length - 1].id, 'att-45', 'Should keep newest mock at the end');

  console.log('✅ INV-028g last_30_mocks filter verified.');
}

function testLast90DaysWindow() {
  console.log('Checking last_90_days filter...');

  const oldAttempt = createAttempt('old', new Date(Date.now() - 100 * 86400000).toISOString()); // 100 days old
  const recentAttempt = createAttempt('recent', new Date(Date.now() - 10 * 86400000).toISOString()); // 10 days old

  const filtered = filterAttemptsByWindow([oldAttempt, recentAttempt], 'last_90_days');
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, 'recent');

  console.log('✅ INV-028g last_90_days filter verified.');
}

function runAllTests() {
  try {
    testLast30MocksWindow();
    testLast90DaysWindow();
    console.log('\n🎉 ALL STAGE 3.3 ANALYTICS WINDOW UNIT TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  }
}

runAllTests();
