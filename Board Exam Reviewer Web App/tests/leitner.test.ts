import assert from 'node:assert/strict';
import { currentPace, boxIntervalFor, addHoursToISO } from '../src/lib/leitner';

console.log('🧪 Running Stage 1b.1 Unit Tests for Leitner Engine (§12)...\n');

// 1. Pace Selection Tests (§2.2)
function testPaces() {
  console.log('Checking Pace Selection logic...');

  assert.equal(currentPace(null), 'Standard');
  assert.equal(currentPace(undefined), 'Standard');
  assert.equal(currentPace('invalid-date'), 'Standard');

  const now = new Date();

  // > 60 days
  const future70 = new Date(now.getTime() + 70 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  assert.equal(currentPace(future70), 'Standard');

  // 31-60 days
  const future45 = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  assert.equal(currentPace(future45), 'Accelerated');

  // <= 30 days
  const future15 = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  assert.equal(currentPace(future15), 'Crunch');

  // Past date or exam day
  const pastDate = '2025-01-01';
  assert.equal(currentPace(pastDate), 'Crunch');

  console.log('✅ Pace Selection tests passed.');
}

// 2. Interval Calculation Tests (§2.2)
function testIntervals() {
  console.log('Checking Box Intervals logic...');

  // Standard pace intervals in hours: Box 1=24, Box 2=72, Box 3=168, Box 4=336, Box 5=720
  assert.equal(boxIntervalFor(1, 'Standard'), 24);
  assert.equal(boxIntervalFor(2, 'Standard'), 72);
  assert.equal(boxIntervalFor(3, 'Standard'), 168);
  assert.equal(boxIntervalFor(4, 'Standard'), 336);
  assert.equal(boxIntervalFor(5, 'Standard'), 720);

  // Accelerated pace intervals: 24, 48, 120, 240, 504
  assert.equal(boxIntervalFor(1, 'Accelerated'), 24);
  assert.equal(boxIntervalFor(2, 'Accelerated'), 48);
  assert.equal(boxIntervalFor(3, 'Accelerated'), 120);
  assert.equal(boxIntervalFor(4, 'Accelerated'), 240);
  assert.equal(boxIntervalFor(5, 'Accelerated'), 504);

  // Crunch pace intervals: 12, 24, 72, 120, 168
  assert.equal(boxIntervalFor(1, 'Crunch'), 12);
  assert.equal(boxIntervalFor(2, 'Crunch'), 24);
  assert.equal(boxIntervalFor(3, 'Crunch'), 72);
  assert.equal(boxIntervalFor(4, 'Crunch'), 120);
  assert.equal(boxIntervalFor(5, 'Crunch'), 168);

  console.log('✅ Box Intervals tests passed.');
}

// 3. ISO Date Formatting & Reschedule Tests (§2.5 Invariants)
function testISOReschedule() {
  console.log('Checking ISO Reschedule logic...');

  const baseIso = '2026-07-19T12:00:00.000Z';
  const rescheduled12h = addHoursToISO(baseIso, 12);
  assert.equal(rescheduled12h, '2026-07-20T00:00:00.000Z');

  const rescheduled24h = addHoursToISO(baseIso, 24);
  assert.equal(rescheduled24h, '2026-07-20T12:00:00.000Z');

  // Verify always in future
  assert.ok(new Date(rescheduled24h).getTime() > new Date(baseIso).getTime());

  console.log('✅ ISO Reschedule tests passed.');
}

function runAllTests() {
  try {
    testPaces();
    testIntervals();
    testISOReschedule();
    console.log('\n🎉 ALL STAGE 1b.1 LEITNER UNIT TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  }
}

runAllTests();
