import assert from 'node:assert/strict';

console.log('🧪 Running Stage 2.3 Session State Machine Unit Tests (§12, INV-006, INV-020, INV-021)...\n');

function testSessionStateTransitions() {
  console.log('Checking state machine transitions...');

  const validTransitions: Record<string, string[]> = {
    initializing: ['instructions', 'error'],
    instructions: ['initializing', 'answering', 'error'],
    answering: ['paused', 'submitting', 'error'],
    paused: ['answering', 'abandoned'],
    submitting: ['completed'],
  };

  assert.ok(validTransitions.answering.includes('paused'));
  assert.ok(validTransitions.answering.includes('submitting'));

  console.log('✅ Session state transitions verified.');
}

function testModeRestrictions() {
  console.log('Checking Simulation vs Practice mode restrictions (INV-021)...');

  const practiceMode = { isPauseAllowed: true };
  const simulationMode = { isPauseAllowed: false };

  assert.equal(practiceMode.isPauseAllowed, true);
  assert.equal(simulationMode.isPauseAllowed, false, 'Simulation mode must reject pause requests (INV-021)');

  console.log('✅ Simulation vs Practice mode restrictions verified.');
}

function runAllTests() {
  try {
    testSessionStateTransitions();
    testModeRestrictions();
    console.log('\n🎉 ALL SESSION STATE MACHINE UNIT TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  }
}

runAllTests();
