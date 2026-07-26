import assert from 'node:assert/strict';
import {
  computeDistribution,
  assertValidTag,
  clampNote,
  ErrorTagId,
} from '../src/lib/errorTags';

console.log('🧪 Running Stage 3.1 Error Tags Unit Tests (INV-026)...\n');

function testComputeDistribution() {
  console.log('Checking INV-026f distribution calculation and 1-decimal rounding...');

  const tags: ErrorTagId[] = ['conceptual', 'conceptual', 'conceptual', 'conceptual', 'misread', 'misread', 'misread', 'guess', 'guess', 'trap'];
  const res = computeDistribution(tags, 10);

  assert.equal(res.totalIncorrect, 10, 'Total incorrect should equal input 10');
  assert.equal(res.taggedCount, 10, 'Tagged count should equal 10');

  const conceptual = res.items.find(i => i.tag === 'conceptual');
  assert.equal(conceptual?.count, 4, 'Conceptual count should be 4');
  assert.equal(conceptual?.percentage, 40.0, 'Conceptual percentage should be 40.0%');

  const misread = res.items.find(i => i.tag === 'misread');
  assert.equal(misread?.count, 3, 'Misread count should be 3');
  assert.equal(misread?.percentage, 30.0, 'Misread percentage should be 30.0%');

  const guess = res.items.find(i => i.tag === 'guess');
  assert.equal(guess?.count, 2, 'Guess count should be 2');
  assert.equal(guess?.percentage, 20.0, 'Guess percentage should be 20.0%');

  const trap = res.items.find(i => i.tag === 'trap');
  assert.equal(trap?.count, 1, 'Trap count should be 1');
  assert.equal(trap?.percentage, 10.0, 'Trap percentage should be 10.0%');

  const rushed = res.items.find(i => i.tag === 'rushed');
  assert.equal(rushed?.count, 0, 'Rushed count should be 0');
  assert.equal(rushed?.percentage, 0, 'Rushed percentage should be 0%');

  console.log('✅ INV-026f distribution calculation verified.');
}

function testZeroDenominatorHandling() {
  console.log('Checking zero denominator handling (no divide-by-zero)...');

  const res = computeDistribution([], 0);
  assert.equal(res.totalIncorrect, 0, 'Total incorrect should be 0');
  assert.equal(res.taggedCount, 0, 'Tagged count should be 0');
  assert.equal(res.items.length, 6, 'Should return 6 items with 0%');
  assert.ok(res.items.every(i => i.percentage === 0), 'All percentages must be 0%');

  console.log('✅ Zero denominator handling verified.');
}

function testTagValidationAndNoteClamping() {
  console.log('Checking assertValidTag and clampNote...');

  assert.doesNotThrow(() => assertValidTag('misread'));
  assert.doesNotThrow(() => assertValidTag('conceptual'));
  assert.doesNotThrow(() => assertValidTag('calculation'));
  assert.doesNotThrow(() => assertValidTag('trap'));
  assert.doesNotThrow(() => assertValidTag('rushed'));
  assert.doesNotThrow(() => assertValidTag('guess'));

  assert.throws(() => assertValidTag('unknown_tag' as any), /Invalid ErrorTagId/);

  const longNote = 'A'.repeat(300);
  const clamped = clampNote(longNote);
  assert.equal(clamped?.length, 280, 'Note should be clamped to 280 characters');

  console.log('✅ Tag validation and note clamping verified.');
}

function runAllTests() {
  try {
    testComputeDistribution();
    testZeroDenominatorHandling();
    testTagValidationAndNoteClamping();
    console.log('\n🎉 ALL STAGE 3.1 ERROR TAGS UNIT TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  }
}

runAllTests();
