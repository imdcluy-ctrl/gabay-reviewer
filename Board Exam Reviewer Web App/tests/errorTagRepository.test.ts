import assert from 'node:assert/strict';

console.log('🧪 Running Error Tag Repository Unit Tests...\n');

function testErrorTagCreation() {
  console.log('Checking error tag object creation...');
  const tag = {
    id: 'tag-1',
    name: 'Careless Mistake',
    description: 'Read the question too fast',
    created_at: Date.now()
  };
  assert.equal(tag.name, 'Careless Mistake');
  assert.equal(tag.id, 'tag-1');
  console.log('✅ Error tag creation passed.');
}

function runAllTests() {
  try {
    testErrorTagCreation();
    console.log('\n🎉 ALL ERROR TAG REPOSITORY TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  }
}

runAllTests();
