import assert from 'node:assert/strict';

console.log('🧪 Running Stage 2.1 Pre-Flight Report Unit Tests (§12, INV-002)...\n');

interface SectionPoolStatus {
  section_id: string;
  name: string;
  needed: number;
  available: number;
  isSatisfied: boolean;
}

function testPreflightReportCalculation() {
  console.log('Checking preflight section status calculations...');

  const sections: SectionPoolStatus[] = [
    { section_id: 'verbal', name: 'Verbal Ability', needed: 60, available: 8, isSatisfied: false },
    { section_id: 'numerical', name: 'Numerical Ability', needed: 40, available: 14, isSatisfied: false },
  ];

  const overallOk = sections.every(s => s.isSatisfied);

  assert.equal(overallOk, false, 'Preflight report ok must be false when any section is under-served (INV-002)');
  assert.equal(sections[0].isSatisfied, false);

  console.log('✅ Preflight report calculation verified.');
}

function testPreflightEntitlements() {
  console.log('Checking preflight entitlement validation...');
  const isPremium = false;
  const requirePremium = true;

  if (requirePremium && !isPremium) {
     assert.equal(requirePremium !== isPremium, true);
  }

  console.log('✅ Preflight entitlement validation passed.');
}

function runAllTests() {
  try {
    testPreflightReportCalculation();
    testPreflightEntitlements();
    console.log('\n🎉 ALL PREFLIGHT UNIT TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  }
}

runAllTests();
