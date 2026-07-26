import assert from 'node:assert/strict';
import { USER_OWNED_TABLES, getTablePolicy } from '../src/lib/userOwnedTables';

console.log('🧪 Running Stage 0 User Owned Tables Registry Unit Tests (§0.8.2)...\n');

function testRegistryCompleteness() {
  console.log('Checking USER_OWNED_TABLES registry definitions...');

  assert.ok(USER_OWNED_TABLES.length >= 13, 'Registry must contain all user-owned tables');

  const errorTagsPolicy = getTablePolicy('error_tags');
  assert.equal(errorTagsPolicy, 'merge_on_auth', 'error_tags table policy must be merge_on_auth');

  const worryDumpsPolicy = getTablePolicy('worry_dumps');
  assert.equal(worryDumpsPolicy, 'browser_local_only', 'worry_dumps table policy must be browser_local_only');

  console.log('✅ Registry definitions verified.');
}

function runAllTests() {
  try {
    testRegistryCompleteness();
    console.log('\n🎉 ALL STAGE 0 REGISTRY UNIT TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  }
}

runAllTests();
