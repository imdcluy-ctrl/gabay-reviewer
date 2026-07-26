import assert from 'node:assert/strict';
import {
  CSC_CHECKLIST_VERSION,
  CSC_EXAM_CHECKLIST_ITEMS,
  computeChecklistStats,
} from '../src/lib/cscExamChecklist';

console.log('🧪 Running Stage 3.2 CSC Exam Checklist Unit Tests (INV-027f)...\n');

function testChecklistItemsAndVersion() {
  console.log('Checking CSC_CHECKLIST_VERSION and mandatory items...');

  assert.equal(CSC_CHECKLIST_VERSION, 1, 'Checklist version must be 1');
  assert.ok(CSC_EXAM_CHECKLIST_ITEMS.length >= 8, 'Checklist must contain at least 8 items');

  const mandatoryItems = CSC_EXAM_CHECKLIST_ITEMS.filter(i => i.isRequired);
  assert.ok(mandatoryItems.length >= 5, 'Must have at least 5 mandatory items (NOSA, Valid ID, Pencils, Pen, Envelope)');

  const nosa = CSC_EXAM_CHECKLIST_ITEMS.find(i => i.id === 'nosa');
  assert.ok(nosa?.isRequired, 'NOSA must be required');

  console.log('✅ Checklist items and version verified.');
}

function testChecklistStatsCalculation() {
  console.log('Checking computeChecklistStats calculation...');

  // Empty checked set
  const emptyStats = computeChecklistStats(new Set());
  assert.equal(emptyStats.checkedCount, 0, 'Checked count should be 0');
  assert.equal(emptyStats.requiredChecked, 0, 'Required checked should be 0');
  assert.equal(emptyStats.isReady, false, 'isReady should be false when required items are missing');

  // Check all mandatory items
  const mandatoryIds = new Set(CSC_EXAM_CHECKLIST_ITEMS.filter(i => i.isRequired).map(i => i.id));
  const readyStats = computeChecklistStats(mandatoryIds);

  assert.equal(readyStats.requiredChecked, readyStats.requiredTotal, 'All required items checked');
  assert.equal(readyStats.isReady, true, 'isReady should be true when all required items are checked');

  console.log('✅ computeChecklistStats calculation verified.');
}

function runAllTests() {
  try {
    testChecklistItemsAndVersion();
    testChecklistStatsCalculation();
    console.log('\n🎉 ALL STAGE 3.2 EXAM CHECKLIST UNIT TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  }
}

runAllTests();
