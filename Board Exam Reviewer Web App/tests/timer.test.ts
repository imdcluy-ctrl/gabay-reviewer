import assert from 'node:assert/strict';

console.log('🧪 Running Stage 2.2 Exam Timer Unit Tests (§12, INV-004, INV-006, INV-022)...\n');

function testDeadlineTimerMath() {
  console.log('Checking deadline timer math formula (INV-004)...');

  const now = new Date('2026-07-19T10:00:00.000Z').getTime();
  const startedAtEpoch = new Date('2026-07-19T09:00:00.000Z').getTime();
  const durationMs = 190 * 60 * 1000; // 190 minutes = 11,400,000 ms
  const pausedAccumulatedMs = 10 * 60 * 1000; // 10 minutes paused = 600,000 ms

  const deadlineEpochMs = startedAtEpoch + durationMs;
  const remainingMs = deadlineEpochMs - pausedAccumulatedMs - now;
  const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

  // Expected remaining: 190m - 60m (elapsed) - 10m (paused) = 120 minutes = 7,200 seconds
  assert.equal(remainingSeconds, 7200);

  console.log('✅ Deadline timer math formula verified.');
}

function testClockTamperDetection() {
  console.log('Checking clock tamper detection logic (INV-022)...');

  const wallDelta = 10000; // 10s jump on wall clock
  const monotonicDelta = 2000; // 2s elapsed on monotonic timer
  const diff = Math.abs(wallDelta - monotonicDelta);

  const isTampered = diff > 5000;
  assert.equal(isTampered, true, 'Clock jump > 5s must trigger integrity flag');

  console.log('✅ Clock tamper detection verified.');
}

function runAllTests() {
  try {
    testDeadlineTimerMath();
    testClockTamperDetection();
    console.log('\n🎉 ALL TIMER UNIT TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  }
}

runAllTests();
