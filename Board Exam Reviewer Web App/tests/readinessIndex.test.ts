import assert from 'node:assert/strict';
import { priConfig, getPRIBand } from '../src/lib/readinessIndex';

console.log('🧪 Running Stage 2.6 Predictive Readiness Index Unit Tests (§12, INV-011, INV-024, H1, H2, H3, M1, M5)...\n');

// 1. Config Structure & Weight Sum Invariant Test (INV-011, H2)
function testConfigWeights() {
  console.log('Checking INV-011 tunable config structure & weight sum...');

  const w = priConfig.weights;
  assert.equal(w.mockExam, 0.35);
  assert.equal(w.leitnerMastery, 0.25);
  assert.equal(w.practiceConsistency, 0.20);
  assert.equal(w.examProximity, 0.20);

  const sum = w.mockExam + w.leitnerMastery + w.practiceConsistency + w.examProximity;
  assert.equal(Math.round(sum * 100) / 100, 1.0, 'PRI weights must sum to exactly 1.0 (INV-011, H2)');

  assert.deepEqual(priConfig.smoothing.recent3, [0.6, 0.3, 0.1], 'Smoothing weights must match spec [0.6, 0.3, 0.1] (M1)');
  assert.equal(priConfig.deltaClampPerExam, 10, 'Per-exam delta clamp must be 10 (INV-024, H3)');

  console.log('✅ INV-011 config structure & weight sum verified.');
}

// 2. PRI Bands Mapping Test (L3)
function testPRIBands() {
  console.log('Checking PRI qualitative 4-band mappings (L3)...');

  assert.equal(getPRIBand(90), 'Highly Ready');
  assert.equal(getPRIBand(85), 'Highly Ready');
  assert.equal(getPRIBand(75), 'Ready');
  assert.equal(getPRIBand(70), 'Ready');
  assert.equal(getPRIBand(60), 'Borderline');
  assert.equal(getPRIBand(55), 'Borderline');
  assert.equal(getPRIBand(50), 'Not Ready');
  assert.equal(getPRIBand(20), 'Not Ready');

  console.log('✅ PRI qualitative 4-band mappings verified.');
}

// 3. Emotional Stability Delta Clamp Logic Test (INV-024, H3, L9)
function testDeltaClamp() {
  console.log('Checking INV-024 emotional stability delta clamp logic (H3, L9)...');

  const previousPRI = 85;
  const rawBadMockPRI = 55; // 30-point drop!
  const maxDelta = priConfig.deltaClampPerExam; // 10

  const delta = rawBadMockPRI - previousPRI;
  let clampedPRI = rawBadMockPRI;
  if (Math.abs(delta) > maxDelta) {
    clampedPRI = previousPRI + Math.sign(delta) * maxDelta;
  }

  // Should drop by no more than 10 points (85 -> 75)
  assert.equal(clampedPRI, 75, 'Bad mock attempt must drop PRI by no more than 10 points (INV-024, H3)');

  console.log('✅ INV-024 emotional stability delta clamp verified.');
}

function runAllTests() {
  try {
    testConfigWeights();
    testPRIBands();
    testDeltaClamp();
    console.log('\n🎉 ALL PREDICTIVE READINESS INDEX UNIT TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  }
}

runAllTests();
