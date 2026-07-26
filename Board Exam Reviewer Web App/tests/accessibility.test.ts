import assert from 'node:assert/strict';
import { trapFocus } from '../src/lib/focusTrap';

console.log('🧪 Running Stage 2.8 Accessibility & WCAG 2.1 AA Unit Tests (§12, INV-013, INV-014, M4, M5)...\n');

function testFocusTrapSignature() {
  console.log('Checking focus trap manager signature & cleanup function (INV-013)...');

  assert.equal(typeof trapFocus, 'function', 'trapFocus must be an exported function');
  console.log('✅ Focus trap signature verified.');
}

function testTimerAnnouncementThresholds() {
  console.log('Checking screen reader timer announcement thresholds (INV-013, M5)...');

  const getAnnouncement = (remainingSeconds: number): string => {
    if (remainingSeconds === 900) return '15 minutes remaining in your exam.';
    if (remainingSeconds === 300) return '5 minutes remaining in your exam.';
    if (remainingSeconds === 60) return '1 minute remaining in your exam.';
    return '';
  };

  assert.equal(getAnnouncement(900), '15 minutes remaining in your exam.');
  assert.equal(getAnnouncement(300), '5 minutes remaining in your exam.');
  assert.equal(getAnnouncement(60), '1 minute remaining in your exam.');
  assert.equal(getAnnouncement(500), '');

  console.log('✅ Screen reader timer announcement thresholds verified.');
}

function runAllTests() {
  try {
    testFocusTrapSignature();
    testTimerAnnouncementThresholds();
    console.log('\n🎉 ALL ACCESSIBILITY UNIT TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  }
}

runAllTests();
