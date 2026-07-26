# Stage 0 — File Map & Policy Reconciliation Report

> **Date**: July 19, 2026  
> **Status**: **STAGE 0 COMPLETE**

---

## 📁 1. Verified Real File Map

- **Dexie Schema**: `src/lib/db.ts` (currently Dexie v3)
- **Guest Merge**: `src/lib/merge.ts`
- **Machine Error Classifier**: `src/lib/leitnerInjection.ts` (`classifyErrorType()`)
- **Review Page**: `src/pages/ExamReview.tsx` (`/exam/:attemptId/review`)
- **Results Page**: `src/pages/MockExamResults.tsx` (`/exam/:attemptId/results`)
- **Statistics Page**: `src/pages/Dashboard.tsx` & existing stats components
- **Focus Trap Utility**: `src/lib/focusTrap.ts`
- **Content Validator**: `scripts/validate-content.ts`

---

## 📌 2. Pinned Decisions (v3 Defaults)

1. **Mock Tag Unique Key**: `[attempt_id+question_id]`
2. **Practice/SR Tag Unique Key**: `[local_user_id+question_id+source+source_session_id]`
3. **`question_id` Stability**: Immutable across content updates.
4. **Practice Loop Tagging in 3.1**: Stretch goal only — Core = mock `ExamReview` + results widget + dashboard teaser.
5. **Mock Single Consumption**: Edge Function `consume_mock_pass` with idempotency key `pass_id + attempt_id`.
6. **Mid-Exam Navigation**: Exiting `/exam/:examId` triggers existing `ExitModal` guards (`INV-021`).
7. **Payments Feature Flag**: `VITE_PAYMENTS_ENABLED` + server `PAYMENTS_ENABLED`.
8. **Chart Library**: Prefer existing `SubtopicRadarChart` SVG patterns.

---

## 🛡️ 3. `USER_OWNED_TABLES` Registry Created
Created `src/lib/userOwnedTables.ts` and `tests/userOwnedTables.test.ts` to enforce merge policy completeness across all Phase 3 Dexie schema additions.
