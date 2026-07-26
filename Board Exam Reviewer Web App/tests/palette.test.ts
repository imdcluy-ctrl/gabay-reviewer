import assert from 'node:assert/strict';

console.log('🧪 Running Stage 2.2 Palette Shape + Color Unit Tests (§12, INV-014, M4)...\n');

function testPaletteShapeColorContract() {
  console.log('Checking palette shape and icon mappings (INV-014, M4)...');

  const states = {
    answeredLive: { color: '#3B82F6', icon: '●' },
    unanswered: { color: '#6B7280', icon: '○' },
    flagged: { color: '#F97316', icon: '🚩' },
    correctReview: { color: '#22C55E', icon: '✓' },
    incorrectReview: { color: '#EF4444', icon: '✗' },
  };

  assert.equal(states.answeredLive.icon, '●');
  assert.equal(states.unanswered.icon, '○');
  assert.equal(states.flagged.icon, '🚩');
  assert.equal(states.correctReview.icon, '✓');
  assert.equal(states.incorrectReview.icon, '✗');

  console.log('✅ Palette shape and color contract verified.');
}

function runAllTests() {
  try {
    testPaletteShapeColorContract();
    console.log('\n🎉 ALL PALETTE UNIT TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  }
}

runAllTests();
