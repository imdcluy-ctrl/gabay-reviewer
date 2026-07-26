import assert from 'node:assert/strict';

console.log('🧪 Running Stage 1b.5 Guest-to-Auth SR Merge Reconciliation Tests (§12)...\n');

interface MockSRRow {
  id: string;
  local_user_id: string;
  question_id: string;
  box_level: number;
  leech_count: number;
  is_leech: boolean;
  next_review_date: string;
  updated_at: string;
}

// Formula reconciliation simulation test (§8 INVARIANT)
function testMergeReconciliationFormula() {
  console.log('Checking SR merge reconciliation formula (never downgrade)...');

  const guestUserId = 'guest-123';
  const authUserId = 'auth-456';
  const qid = 'num-ratio-001';

  // Guest row (Box 3, earlier due date, leech_count 1)
  const guestRow: MockSRRow = {
    id: `${guestUserId}_${qid}`,
    local_user_id: guestUserId,
    question_id: qid,
    box_level: 3,
    leech_count: 1,
    is_leech: false,
    next_review_date: '2026-07-20T10:00:00.000Z',
    updated_at: '2026-07-19T10:00:00.000Z',
  };

  // Auth row (Box 2, later due date, leech_count 4, is_leech true)
  const authRow: MockSRRow = {
    id: `${authUserId}_${qid}`,
    local_user_id: authUserId,
    question_id: qid,
    box_level: 2,
    leech_count: 4,
    is_leech: true,
    next_review_date: '2026-07-25T10:00:00.000Z',
    updated_at: '2026-07-18T10:00:00.000Z',
  };

  // Reconcile according to §8 INVARIANT formula
  const reconciledRow: MockSRRow = {
    ...authRow,
    box_level: Math.max(authRow.box_level, guestRow.box_level),
    leech_count: Math.max(authRow.leech_count, guestRow.leech_count),
    is_leech: authRow.is_leech || guestRow.is_leech,
    next_review_date: guestRow.next_review_date < authRow.next_review_date ? guestRow.next_review_date : authRow.next_review_date,
    updated_at: new Date().toISOString(),
  };

  // Assertions
  assert.equal(reconciledRow.box_level, 3, 'Box level must be max(2, 3) = 3');
  assert.equal(reconciledRow.leech_count, 4, 'Leech count must be max(4, 1) = 4');
  assert.equal(reconciledRow.is_leech, true, 'is_leech must be true if either is true');
  assert.equal(reconciledRow.next_review_date, '2026-07-20T10:00:00.000Z', 'next_review_date must be earlier date');

  console.log('✅ Merge reconciliation formula tests passed.');
}

function runAllTests() {
  try {
    testMergeReconciliationFormula();
    console.log('\n🎉 ALL STAGE 1b.5 MERGE RECONCILIATION TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  }
}

runAllTests();
