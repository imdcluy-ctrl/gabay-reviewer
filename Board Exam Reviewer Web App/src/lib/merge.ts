import { db } from './db';

export async function mergeGuestToAuth(guestUserId: string, authUserId: string): Promise<void> {
  if (!guestUserId || !authUserId || guestUserId === authUserId) return;

  try {
    await db.transaction(
      'rw',
      [
        db.attempts,
        db.journal_entries,
        db.review_state,
        db.user_profile,
        db.mock_exam_attempts,
        db.mock_exam_answers,
        db.mock_exam_pauses,
        db.mock_exam_injections,
        db.error_tags,
        db.checklist_progress,
        db.user_entitlements,
      ],
      async () => {
        // 1. Re-tag attempts
        const guestAttempts = await db.attempts
          .where('local_user_id')
          .equals(guestUserId)
          .toArray();
        if (guestAttempts.length > 0) {
          const updatedAttempts = guestAttempts.map(a => ({
            ...a,
            local_user_id: authUserId,
          }));
          await db.attempts.bulkPut(updatedAttempts);
        }

        // 2. Re-tag journal entries
        const guestJournals = await db.journal_entries
          .where('local_user_id')
          .equals(guestUserId)
          .toArray();
        if (guestJournals.length > 0) {
          const updatedJournals = guestJournals.map(j => ({
            ...j,
            local_user_id: authUserId,
          }));
          await db.journal_entries.bulkPut(updatedJournals);
        }

        // 3. Re-tag & Reconcile Spaced Repetition review_state (§8 INVARIANT)
        const guestSR = await db.review_state
          .where('local_user_id')
          .equals(guestUserId)
          .toArray();
        for (const row of guestSR) {
          const newId = `${authUserId}_${row.question_id}`;
          const authRow = await db.review_state.get(newId);

          if (!authRow) {
            await db.review_state.put({ ...row, id: newId, local_user_id: authUserId });
          } else {
            // Reconcile: never downgrade the authed learner
            await db.review_state.put({
              ...authRow,
              box_level: Math.max(authRow.box_level, row.box_level),
              leech_count: Math.max(authRow.leech_count, row.leech_count),
              is_leech: authRow.is_leech || row.is_leech,
              next_review_date:
                row.next_review_date < authRow.next_review_date
                  ? row.next_review_date
                  : authRow.next_review_date,
              updated_at: new Date().toISOString(),
            });
          }
          await db.review_state.delete(row.id); // remove old guest-keyed row
        }

        // 4. Re-tag Phase 2 Mock Exam Attempts (§3.6)
        const guestMockAttempts = await db.mock_exam_attempts
          .where('local_user_id')
          .equals(guestUserId)
          .toArray();

        if (guestMockAttempts.length > 0) {
          const updatedMockAttempts = guestMockAttempts.map(ma => ({
            ...ma,
            local_user_id: authUserId,
          }));
          await db.mock_exam_attempts.bulkPut(updatedMockAttempts);
        }

        // 5. Re-tag Phase 3 Error Tags (§3.1, INV-026)
        const guestErrorTags = await db.error_tags
          .where('local_user_id')
          .equals(guestUserId)
          .toArray();

        if (guestErrorTags.length > 0) {
          const updatedErrorTags = guestErrorTags.map(et => ({
            ...et,
            local_user_id: authUserId,
          }));
          await db.error_tags.bulkPut(updatedErrorTags);
        }

        // 6. Re-tag Phase 3 Checklist Progress (§3.2, INV-027f)
        const guestChecklist = await db.checklist_progress
          .where('local_user_id')
          .equals(guestUserId)
          .toArray();

        if (guestChecklist.length > 0) {
          for (const item of guestChecklist) {
            const newKey = item.key.replace(guestUserId, authUserId);
            await db.checklist_progress.put({
              ...item,
              key: newKey,
              local_user_id: authUserId,
            });
            if (item.key !== newKey) {
              await db.checklist_progress.delete(item.key);
            }
          }
        }

        // 7. Re-tag Phase 3 User Entitlements (§3.4, INV-029f)
        const guestEntitlement = await db.user_entitlements.get(guestUserId);
        if (guestEntitlement) {
          const authEntitlement = await db.user_entitlements.get(authUserId);
          const isPremium = (authEntitlement?.is_premium || guestEntitlement.is_premium);
          const planType = isPremium ? 'pro' : (authEntitlement?.plan_type || guestEntitlement.plan_type);

          await db.user_entitlements.put({
            ...guestEntitlement,
            id: authUserId,
            local_user_id: authUserId,
            plan_type: planType,
            is_premium: isPremium,
            updated_at: Date.now(),
          });
          if (guestUserId !== authUserId) {
            await db.user_entitlements.delete(guestUserId);
          }
        }

        // 8. Update profile
        const profile = await db.user_profile.get(guestUserId);
        if (profile) {
          await db.user_profile.update(guestUserId, {
            auth_user_id: authUserId,
            local_merge_completed: true,
          });
        }

        console.log(
          `Merged ${guestAttempts.length} attempts, ${guestJournals.length} journals, ${guestSR.length} review states, ${guestMockAttempts.length} mock attempts, and ${guestErrorTags.length} error tags from guest (${guestUserId}) to auth (${authUserId}).`
        );
      }
    );
  } catch (error) {
    console.error('Error in mergeGuestToAuth:', error);
  }
}
