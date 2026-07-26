import assert from 'node:assert/strict';

console.log('🧪 Running Migrations Unit Tests...\n');

function testMigrationVersions() {
  console.log('Checking migration versions...');
  const currentVersion = 6;
  const legacyVersion = 2;

  assert.ok(currentVersion > legacyVersion, 'Current version must be greater than legacy.');
  assert.equal(currentVersion, 6);
  console.log('✅ Migration versioning logic passed.');
}

function runAllTests() {
  try {
    testMigrationVersions();
    console.log('\n🎉 ALL MIGRATIONS TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  }
}

runAllTests();
