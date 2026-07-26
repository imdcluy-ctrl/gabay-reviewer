import assert from 'node:assert/strict';
import { phaseAt, BREATH_PHASE_LABELS } from '../src/lib/boxBreathing';

console.log('🧪 Running Stage 3.2 Box Breathing Unit Tests (INV-027c)...\n');

function testPhaseAtMath() {
  console.log('Checking phaseAt() 4-4-4-4 cycle sequence and timing accuracy...');

  // Inhale Phase (0ms to 3999ms)
  const t0 = phaseAt(0);
  assert.equal(t0.phase, 'inhale', '0ms should be Inhale phase');
  assert.equal(t0.phaseIndex, 0, 'Inhale phaseIndex should be 0');
  assert.equal(t0.secondsRemainingInPhase, 4, '4s remaining at 0ms');
  assert.equal(t0.currentCycle, 1, 'Cycle 1 at 0ms');

  const t2000 = phaseAt(2000);
  assert.equal(t2000.phase, 'inhale', '2000ms should be Inhale phase');
  assert.equal(t2000.secondsRemainingInPhase, 2, '2s remaining at 2000ms');

  // Hold Full Phase (4000ms to 7999ms)
  const t4000 = phaseAt(4000);
  assert.equal(t4000.phase, 'holdFull', '4000ms should be Hold Full phase');
  assert.equal(t4000.phaseIndex, 1, 'Hold Full phaseIndex should be 1');
  assert.equal(t4000.secondsRemainingInPhase, 4, '4s remaining at 4000ms');

  // Exhale Phase (8000ms to 11999ms)
  const t8000 = phaseAt(8000);
  assert.equal(t8000.phase, 'exhale', '8000ms should be Exhale phase');
  assert.equal(t8000.phaseIndex, 2, 'Exhale phaseIndex should be 2');

  // Hold Empty Phase (12000ms to 15999ms)
  const t12000 = phaseAt(12000);
  assert.equal(t12000.phase, 'holdEmpty', '12000ms should be Hold Empty phase');
  assert.equal(t12000.phaseIndex, 3, 'Hold Empty phaseIndex should be 3');

  // Second Cycle Transition (16000ms)
  const t16000 = phaseAt(16000);
  assert.equal(t16000.phase, 'inhale', '16000ms should reset to Inhale phase');
  assert.equal(t16000.currentCycle, 2, '16000ms should increment to Cycle 2');

  console.log('✅ INV-027c phaseAt() cycle sequence and timing verified.');
}

function testPhaseLabels() {
  console.log('Checking BREATH_PHASE_LABELS bilingual coverage...');

  assert.ok(BREATH_PHASE_LABELS.inhale.en && BREATH_PHASE_LABELS.inhale.tl);
  assert.ok(BREATH_PHASE_LABELS.holdFull.en && BREATH_PHASE_LABELS.holdFull.tl);
  assert.ok(BREATH_PHASE_LABELS.exhale.en && BREATH_PHASE_LABELS.exhale.tl);
  assert.ok(BREATH_PHASE_LABELS.holdEmpty.en && BREATH_PHASE_LABELS.holdEmpty.tl);

  console.log('✅ BREATH_PHASE_LABELS verified.');
}

function runAllTests() {
  try {
    testPhaseAtMath();
    testPhaseLabels();
    console.log('\n🎉 ALL STAGE 3.2 BOX BREATHING UNIT TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  }
}

runAllTests();
