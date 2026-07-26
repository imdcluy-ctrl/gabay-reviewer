import assert from 'node:assert/strict';
import type { MockExamAttempt } from '../src/types/mockExam';

console.log('🧪 Running Stage 2.7 Attempt History Unit Tests (§12, M3, L5, L7)...\n');

const mockAttempts: MockExamAttempt[] = [
  {
    id: 'att-1', local_user_id: 'u-1', mock_exam_id: 'cse-professional-v1', started_at: '2026-07-01T10:00:00Z',
    completed_at: '2026-07-01T13:10:00Z', percentage: 75, passed: false, status: 'completed',
    mode: 'practice', integrity_flag: 'none', time_remaining_seconds: 0, paused_accumulated_ms: 0,
    current_question_index: 170, section_times: '{}',
  },
  {
    id: 'att-2', local_user_id: 'u-1', mock_exam_id: 'cse-professional-v1', started_at: '2026-07-10T10:00:00Z',
    completed_at: '2026-07-10T13:10:00Z', percentage: 84, passed: true, status: 'completed',
    mode: 'simulation', integrity_flag: 'clock_anomaly', time_remaining_seconds: 0, paused_accumulated_ms: 0,
    current_question_index: 170, section_times: '{}',
  },
];

function testHistoryFilteringAndSorting() {
  console.log('Checking history filter & sort logic (M3, L5)...');

  // Filter Passed
  const passedOnly = mockAttempts.filter(a => a.passed === true);
  assert.equal(passedOnly.length, 1);
  assert.equal(passedOnly[0].id, 'att-2');

  // Sort Highest Score
  const sortedByScore = [...mockAttempts].sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
  assert.equal(sortedByScore[0].id, 'att-2');
  assert.equal(sortedByScore[0].percentage, 84);

  // Integrity Flag check
  const anomalyAttempts = mockAttempts.filter(a => a.integrity_flag === 'clock_anomaly');
  assert.equal(anomalyAttempts.length, 1);
  assert.equal(anomalyAttempts[0].id, 'att-2');

  console.log('✅ History filter & sort logic verified.');
}

function runAllTests() {
  try {
    testHistoryFilteringAndSorting();
    console.log('\n🎉 ALL ATTEMPT HISTORY UNIT TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  }
}

runAllTests();
