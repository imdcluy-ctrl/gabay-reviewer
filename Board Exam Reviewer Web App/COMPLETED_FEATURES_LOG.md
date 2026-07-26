# GABAY AI — Living Completed Features Log

> **Project Root Tracking File**: Updated after every completed stage for external AI analysis, planning, and progress handoffs.  
> **Last Updated**: July 19, 2026 (Phase 1a, 1b, Phase 2 Stage 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7 & 2.8 — **PHASE 2 100% COMPLETED**)

---

## 🏛️ Project Foundations & Core Architecture
- **Tech Stack**: Vite + React 18 + TypeScript (`strict: true`) + Dexie IndexedDB + Supabase Auth + PostHog Analytics + PWA (`vite-plugin-pwa`).
- **Design Tokens (`src/index.css`)**: Glassmorphism cards, dark/light/system theme custom properties, accessible focus outlines (`:focus-visible` 3px outline, M4), responsive mobile-first typography (`Outfit`, `Inter`, `JetBrains Mono`).

---

## ✅ Phase 1a — Baseline Features (100% Completed)
1. **Onboarding Diagnostic (`/`)**: 5-question baseline assessment stored in local state (never pollutes Leitner attempts).
2. **5-Layer Socratic Study Loop (`src/hooks/useStudySession.ts`)**:
   - State machine: `loading` ➔ `answering` ➔ `hinting` ➔ `confidence` ➔ `result` ➔ `deconstruction` ➔ `journal` ➔ `break` ➔ `complete`.
   - 4-rung Socratic Hint Ladder (`src/components/HintLadder.tsx`).
   - Metacognitive Confidence Check (1: Unsure, 2: Maybe, 3: Sure).
   - 4-section Worked Deconstruction Card (`src/components/DeconstructionCard.tsx`).
   - Self-explanation Journal Input (`src/components/JournalInput.tsx`).
   - 20-Question Pomodoro Break Overlay (`src/components/BreakSuggestion.tsx`).
3. **Dashboard & Analytics (`/dashboard`, `/statistics`)**: Accuracy statistics, category progress cards, streak tracker, exam countdown timer, subtopic breakdown.
4. **Password-Gated Admin Review UI (`/admin`)**: Staff preview tool for student experience, hints, deconstructions, and metadata (Password: `gabay2026`).
5. **Supabase Auth & Idempotent Guest Merge (`src/lib/auth.ts`, `src/lib/merge.ts`)**: Cloud signup/login with local Dexie fallback and guest-to-auth progress migration.
6. **Offline Banner & PWA Support**: Workbox runtime caching for Google fonts and content JSON.

---

## ✅ Phase 1b — Spaced Repetition & Content Pilot (100% Completed)
1. **Dexie Version 2 Schema (`src/lib/db.ts`)**: Added indexed fields (`next_review_date`, `leech_count`, `is_leech`, `updated_at`) with zero-body migration.
2. **Leitner Core Mathematical Engine (`src/lib/leitner.ts`)**:
   - 6-state metacognitive matrix (`rateLeitnerCard()`).
   - 3 pace interval ramps (`Standard`, `Accelerated`, `Crunch`).
   - Stagnation tie-breaker (`shaky_correct_streak >= 2` ➔ promotes +1 box).
   - Overconfidence leech lifecycle (`leech_count >= 3` ➔ priority #1 in review; cleared after 2 consecutive correct answers).
   - Infinite loop guard invariant (`next_review_date` strictly in future).
   - Idempotent lazy backfill (`backfillReviewState`).
3. **Unified Priority Selection Engine (`src/lib/questionSelection.ts`)**: Priority ladder (Leeches ➔ Box 1/2 ➔ Box 3-5 ➔ Unseen ➔ Weak subtopics), 20-card daily review cap, leech overflow policy.
4. **Spaced Review Queue UI (`src/pages/ReviewQueue.tsx`)**: Colorblind-safe visual box stacks (Red, Orange, Yellow, Teal, Green), true due counts, overflow banner, review session launcher.
5. **Forced Deconstruction State Branch**: Leech cards loaded in `/review` force students to re-read worked solutions *before* re-testing.
6. **Guest Backup Nudge (`src/components/BackupNudge.tsx`)**: Non-blocking toast for guests answering correctly with ≥1 hint; 14-day snooze in `localStorage`.
7. **SR Merge Reconciliation (`src/lib/merge.ts`)**: Non-downgrade spaced repetition reconciliation algorithm (max box level, max leech count, OR for leech status, earlier due date).
8. **Expanded Content Dataset**: Started with 37, now expanded to **579 golden YAML questions** (Batch 1 integration) across all 5 CSE categories with full 5-layer Socratic pedagogy, validated via `scripts/validate-content.ts` (Version 4 bump).
9. **Unit Test Suites**: `tests/leitner.test.ts`, `tests/selection.test.ts`, `tests/merge.test.ts`.

---

## ✅ Phase 2 Stage 2.1 — Schema v3, Snapshotting, Selection, Ledger & Pre-flight (100% Completed)
1. **Dexie Version 3 Schema & Zero-Data-Loss Migration (`src/lib/db.ts`, `v3_mock_exams.ts`, `INV-001`)**:
   - Stores: `mock_exams`, `mock_exam_attempts`, `mock_exam_answers`, `mock_exam_pauses`, `mock_exam_injections`.
   - Compound indexes: `[local_user_id+question_id]` on `review_state`, `[local_user_id+mock_exam_id+status]` on `mock_exam_attempts`, `[attempt_id+question_id]` on `mock_exam_injections`.
2. **Immutable Question Snapshotting (`src/types/mockExam.ts`, `INV-019`)**: Stores stem, options, correct_option, explanation, hint ladder, deconstruction, trap type, subtopic, category ID, and content_version.
3. **Replay-Safe Injection Ledger (`mock_exam_injections`, `INV-009`)**: Prevents duplicate Leitner box drops or leech escalations upon score recalculation.
4. **Mock Exam Selection Engine & Pre-flight Gate (`src/lib/mockExamSelection.ts`, `mockExamPreflight.ts`, `INV-002`, `INV-003`, `INV-012`, `INV-017`)**:
   - Respects section item counts, zero intra-exam duplicate items, retake overlap target (≤30% with warnings), entitlement filtering.
   - CLI Pre-flight validator (`scripts/exam-preflight.ts`).
5. **Account Linking Extension (`src/lib/merge.ts`)**: Re-tags all v3 mock exam tables on guest registration.
6. **Unit Test Suites**: `tests/migrations.test.ts`, `tests/selection.test.ts`, `tests/preflight.test.ts`, `tests/accountLinking.test.ts`.

---

## ✅ Phase 2 Stage 2.2 — Deadline-Based Timer, Persistence & Performance (100% Completed)
1. **Deadline-Based Immutable Timer Hook (`src/hooks/useExamTimer.ts`)**:
   - Timestamp formula: `remaining_ms = deadline_epoch_ms - paused_accumulated_ms - Date.now()` (`INV-004`).
   - Background tab auto-submit (`INV-006`): Recomputes remaining time and fires `onTimeout()` on `visibilitychange` & focus events.
   - Clock tamper detection (`INV-022`): Compares `Date.now()` vs `performance.now()` deltas; sets `integrity_flag = 'clock_anomaly'` if diff > 5s.
   - Screen reader announcements (`aria-live="polite"`) at 15m, 5m, 1m warnings (M5).
   - Throttled renders: 1s `setInterval` update; rAF reserved exclusively for <60s pulsing visual (`INV-025`).
2. **Mock Exam Persistence Layer (`src/lib/mockExamPersistence.ts`)**:
   - `createAttempt()` with full `content_snapshot` (`INV-019`, M6).
   - `loadResumableAttempt()` with single-active attempt guard (`INV-016`) superseding stale duplicate attempts (L4).
   - Local answer autosave ≤5s (`INV-005`).
   - Crash recovery (`INV-007`).
   - `recordPause()` & `recordResume()` deadline math (M2).
   - `finalizeAttempt()` score submission (M6).
3. **Coalesced Remote Sync Manager (`src/lib/examSync.ts`, `INV-018`, M3)**:
   - Debounces attempt state syncs to ≤1 write per 30 seconds (`INV-018`); `'final'` flushes immediately.
4. **Colorblind-Safe Question Palette (`src/components/exam/QuestionPalette.tsx`, `INV-014`, M4, L3)**:
   - WCAG 1.4.1 Shape + Color: Answered (Blue `●`), Unanswered (Gray `○`), Flagged (Orange `🚩`), Correct Review (Green `✓`), Incorrect Review (Red `✗`).
   - `mode: 'live' | 'review'` support.
   - `F` keyboard shortcut to flag items.
   - Memoized state derived over map keys (`INV-025`).
5. **Sticky Exam Header (`src/components/exam/ExamHeader.tsx`)**:
   - Sticky bar with title, section badge, mode badge, progress bar, timer color ramps (White ➔ Orange ➔ Red ➔ Pulse), pause/resume button, flag current button, and palette toggle (`📋`) (L2).
6. **Playwright E2E Suite & Unit Tests**:
   - `tests/e2e/mockExam-timer.e2e.ts` (Playwright real browser tests for background tab auto-submit, reload recovery, clock tampering) (H1).
   - `tests/timer.test.ts`, `tests/persistence.test.ts`, `tests/palette.test.ts`, `tests/syncCoalesce.test.ts`.

---

## ✅ Phase 2 Stage 2.3 — Session State Machine, Modes & Exam Runner (100% Completed)
1. **Mock Exam Session State Machine Hook (`src/hooks/useMockExamSession.ts`)**:
   - States: `initializing` ➔ `instructions` (ephemeral M4) ➔ `answering` ➔ `paused` ➔ `submitting` ➔ `completed` ➔ `error`.
   - Binds `useExamTimer.onTimeout` for automatic deadline auto-submit (`INV-006`, M1).
   - Multi-device active attempt resume prompt (`INV-016`, L2).
   - Practice vs Real Simulation mode guards (`INV-021`).
   - Instant Dexie autosave on answer selection, flag toggle, pause, resume, and final submit (L5).
2. **Submit Confirmation Modal (`src/components/exam/SubmitConfirmationModal.tsx`, H1, §5.3)**:
   - Displays unanswered question count, flagged count, remaining time, and mode reminder before submission.
   - Keyboard shortcuts: `Enter` to submit, `Escape` to continue exam.
3. **Pause Overlay (`src/components/exam/PauseOverlay.tsx`, M3, §5.4)**:
   - Practice mode only (`INV-021`). Shows current question stem text while hiding answer choices completely.
   - Resume and Exit Exam (Abandon) actions.
4. **Exit Modal (`src/components/exam/ExitModal.tsx`, L7)**:
   - Practice mode: Resume, Save & Pause, or Abandon.
   - Simulation mode: Hard warning with Resume or Abandon (no pausing allowed).
5. **Simulated Exam Runner Page (`src/pages/MockExamSession.tsx`, M2, L6, INV-020)**:
   - Route `/exam/:examId` code-split into a 24.67 kB dynamic chunk (`React.lazy`).
   - Pre-exam intro screen with section breakdown and §1.2 CSC honesty disclaimer ("Independent self-assessment tool, not officially proctored CSC exam").
   - Advisory Section Banners (`INV-020`) with unrestricted cross-section item navigation.
   - Full keyboard navigation (`A`/`B`/`C`/`D`, Arrow keys, `F` flag).
6. **Playwright E2E & Unit Test Suites**:
   - `tests/sessionStateMachine.test.ts` (State transitions & mode restrictions).
   - `tests/e2e/mockExam-session.e2e.ts` (All 6 §5.6 Playwright session scenarios).

---

## ✅ Phase 2 Stage 2.4 — Official CSC Scoring, Diagnostics & Fatigue Modeling (100% Completed)
1. **Snapshot Scoring Engine (`src/lib/scoring.ts`, INV-008, INV-019)**:
   - Evaluates scores, percentages (rounded to 2 decimals), and pass/fail status exclusively from immutable `content_snapshot` attached to answer rows (`INV-019`).
   - Official CSC 80% passing cutoff (`INV-008`: 136/170 Professional, 132/165 Sub-Professional).
   - Sourced section breakdown and subtopic mastery diagnostics (identifies weak areas <60%).
2. **Pacing Analysis Engine (`src/lib/pacing.ts`, H1, §6.2)**:
   - Categorizes answers into 4 pacing buckets: `time_wasters` (>120s wrong — feeds Stage 2.5 conceptual error classification), `efficient_correct` (>120s right), `rushed_incorrect` (<20s wrong — feeds Stage 2.5 careless error classification), and `optimal_range` (30–90s band).
   - Sourced from `mock_exam_answers.time_spent_seconds` (L4).
3. **Cognitive Fatigue Detection Engine (`src/lib/fatigue.ts`, INV-023)**:
   - Splits test attempts into 4 chronological quartiles (Q1, Q2, Q3, Q4) sorted by `question_index`.
   - Computes fatigue delta $\Delta = A_{Q1} - A_{Q4}$.
   - Triggers "Cognitive Stamina Deficit" warning if $\Delta \ge 0.15$ (15 percentage points) with templated stamina recommendations (L7).
4. **Performance Diagnostics Results Page (`src/pages/MockExamResults.tsx`, M3, §6.3)**:
   - Route `/exam/:attemptId/results` code-split into a 12.56 kB dynamic chunk (`React.lazy`).
   - Component suite: `ExamResultsSummary` (Hero score banner, mode badge, clock anomaly warning, §1.2 CSC disclaimer, M2), `SectionBreakdownChart` (Section accuracy & per-section timing, L2), `SubtopicRadarChart` (Subtopic mastery SVG radar, L1), `PacingAnalysisPanel` (Time wasters & rushed errors, H1), `FatiguePanel` (Q1–Q4 progression & INV-023 alerts).
5. **Playwright E2E & Unit Test Suites**:
   - `tests/scoring.test.ts`: Pinned to all 8 Appendix B boundary fixtures (170/170, 136/170 pass, 135/170 fail, 165/165, 132/165 pass, 131/165 fail, all-unanswered, zero-correct) and snapshot isolation (`INV-019`, M1).
   - `tests/pacing.test.ts`: Pacing categorization unit tests (H1).
   - `tests/fatigue.test.ts`: Cognitive fatigue 15pp drop unit tests (`INV-023`).
   - `tests/e2e/mockExam-results.e2e.ts`: Playwright results summary scenarios.

---

## ✅ Phase 2 Stage 2.5 — Review Screen & Cognition-Aware Leitner Injection (100% Completed)
1. **Shared Pacing & Leitner Constants (`src/lib/config/leitner.ts`, L3)**:
   - `CARELESS_THRESHOLD_SECONDS = 20`, `CONCEPTUAL_THRESHOLD_SECONDS = 120`.
   - `leitnerConfig.promote_correct_exam_answers = false` default to preserve 'exam = assessment' asymmetry (H1, INV-010).
2. **Replay-Safe Cognition-Aware Injection Engine (`src/lib/leitnerInjection.ts`, INV-009, INV-010, H1, H2, M1, M2)**:
   - Atomic transaction wrapper over `review_state`, `mock_exam_injections`, `mock_exam_attempts` (H2).
   - `classifyErrorType(answer)` returns `'careless'`, `'conceptual'`, `'standard'`, `'timeout'`, or `'correct'`.
   - `careless` (<20s wrong) ➔ demotes Box -1, NO leech increment (M1).
   - `conceptual` (>120s wrong) ➔ resets Box to 1, increments `leech_count` +1 (M1).
   - `standard` (20-120s wrong) ➔ demotes Box to `min(existing_box, 2)` (M2), increments `leech_count` +1.
   - `timeout` (unanswered) ➔ demotes Box to `max(existing_box - 1, 1)`, NO leech increment (M1).
   - Correct answers: Skipped by default (`INV-010`, H1).
3. **Post-Exam Question Review Screen (`src/pages/ExamReview.tsx`, M3, §7.1)**:
   - Route `/exam/:attemptId/review` code-split into a 5.77 kB dynamic chunk (`React.lazy`).
   - Sourced **exclusively** from `content_snapshot` (`INV-019`, L7).
   - Filter bar (`All`, `Incorrect`, `Flagged`, `Careless Errors`, `Conceptual Errors`).
   - Reuses `QuestionPalette` in `mode: 'review'` with Green `✓` and Red `✗` indicators.
   - Integrated 5-Layer Socratic Pedagogy Card: Stem, choices, `HintLadder`, `DeconstructionCard`, and `JournalInput` (persisted to `journal_entries` table with source metadata, M3).
4. **Injection Toast Notification (`ExamResultsSummary.tsx`, L5)**:
   - Displays post-exam toast: `"🎯 X mistakes injected into Spaced Review Queue: (Y conceptual, Z careless, W timeout). Open Review Queue ➔"`.
5. **Playwright E2E & Unit Test Suites**:
   - `tests/leitnerInjection.test.ts`: Tests error classification, `INV-010` default-off promotion (H1), `INV-010` demotion box & leech targets (M1, M2), and replay guard (`INV-009`).
   - `tests/e2e/mockExam-review.e2e.ts`: Playwright review screen filter and journal saving scenarios.

---

## ✅ Phase 2 Stage 2.6 — Predictive Readiness Index (PRI) Engine & Emotional Stability (100% Completed)
1. **Single Tunable Config Object (`src/lib/readinessIndex.ts`, INV-011, H1, H2, H3, M1)**:
   - Authoritative weights: `mockExam: 0.35`, `leitnerMastery: 0.25`, `practiceConsistency: 0.20`, `examProximity: 0.20` (H2).
   - Exponential smoothing over last 3 mock exams using `[0.6, 0.3, 0.1]` (M1).
   - Emotional stability per-exam delta clamp `deltaClampPerExam: 10` (`INV-024`, H3).
2. **Predictive Readiness Engine Calculation (`src/lib/readinessIndex.ts`)**:
   - Gathers smoothed mock performance, Leitner Box 4+5 mastery with leech penalties (L6), practice volume × accuracy × streak (L4), and dynamic exam date proximity (M4).
   - Graceful degradation for missing `exam_date` (M5): redistributes proximity weight proportionally over remaining 3 components without crashing.
   - Enforces `INV-024` delta clamp: `|newPRI - previousPRI| <= 10`.
   - Qualitative 4-band mapping: `<55 Not Ready`, `55-69 Borderline`, `70-84 Ready`, `≥85 Highly Ready` (L3).
3. **Readiness Index Dashboard Widget (`src/components/ReadinessIndex.tsx`, §8.3, M2, M3, L1, L8)**:
   - Embedded on `/dashboard`.
   - Visual 0–100 PRI score ring & band badge. No uncalibrated probability numbers (M2).
   - Top 3 Actionable Improvement Factors (`factors` array, M3) & readiness projection (`daysToReady`, `recommendedDailyQuestions`, L7).
   - 5-Category mastery breakdown grid with 🔴 At-Risk / 🟡 Developing / 🟢 Exam-Ready badges (L3).
   - Conditional "Take Mock Exam" CTA if cold-start (L8).
   - Honesty disclaimer footer: *"Estimated readiness based on your practice patterns — not a guaranteed outcome."* (L1).
4. **Playwright E2E & Unit Test Suites**:
   - `tests/readinessIndex.test.ts`: Tests `INV-011` config weight sum, qualitative 4-band mappings, and `INV-024` emotional stability ±10 delta clamp (H3, L9).
   - `tests/e2e/predictive-readiness.e2e.ts`: Playwright dashboard widget rendering scenarios.

---

## ✅ Phase 2 Stage 2.7 — Retake Manager Orchestrator & Attempt History Hub (100% Completed)
1. **Retake Manager Orchestrator (`src/lib/retakeManager.ts`, H1, M1, M2, L1, L4, L5)**:
   - Single canonical selection engine orchestration (`selectMockExamQuestions` from Stage 2.1, H1).
   - Overlap window constrained to **last 2 attempts** only (M1).
   - Soft cooldown check `canRetakeExam(userId, mockExamId)` (M2): surfaces 3/week warning when `attemptsLast7Days >= 3`, but always allowed (warn-not-block philosophy).
   - `generateRetakeSelection()` enforces $\le 30\%$ overlap target (`INV-012`). Sets `isHighOverlap = true` with warning text when pool size forces repeat questions $>30\%$.
2. **Retake Launcher Modal (`src/components/exam/RetakeLauncher.tsx`, §9.2, INV-012, M2, L2, L3)**:
   - Pre-flight overlap badge (Green ✅ $\le 30\%$ / Amber ⚠️ $>30\%$).
   - Soft cooldown warning callout for $\ge 3$ attempts/week (M2).
   - Practice vs Real Simulation mode selector (`INV-021`).
3. **Attempt History & Retake Hub (`src/pages/ExamHistory.tsx`, §9.1, M3, L4, L5)**:
   - Route `/exam/history` code-split into a 9.49 kB dynamic chunk (`React.lazy`).
   - Filter bar (`All` / `Passed` / `Failed` / `Professional` / `Sub-Professional` / `Practice` / `Simulation`).
   - Sort selector (`Date (Newest First)` sorted by `completed_at`, L5 / `Score (Highest First)`).
   - Active time spent calculation (`completed_at - started_at - paused_accumulated`, L4).
   - Amber ⚠️ **Integrity Flag Indicator** on attempts with `integrity_flag === 'clock_anomaly'` (M3).
   - Action buttons: "Performance Diagnostics" (`/exam/:attemptId/results`), "Socratic Answer Review" (`/exam/:attemptId/review`), and "Retake Exam" (opens `RetakeLauncher`).
4. **Playwright E2E & Unit Test Suites**:
   - `tests/retakeManager.test.ts`: Tests retake manager orchestrator and soft cooldown `canRetakeExam` (§9.2, H1, M2).
   - `tests/history.test.ts`: Tests history filter bar, sort order, and clock anomaly integrity flags (§9.1, M3).
   - `tests/e2e/mockExam-retake.e2e.ts`: Playwright history page and retake launcher scenarios.

---

## ✅ Phase 2 Stage 2.8 — PWA, Accessibility, Consolidated E2E & DoD Audit (100% Completed)
1. **PWA Offline Operations & Background Sync (`vite.config.ts`, `sw.js`, §10.1, H1, INV-015)**:
   - Workbox runtime cache-first strategy for question JSON and snapshot content.
   - Background sync queue flushes coalesced attempt state when connectivity returns.
2. **WCAG 2.1 AA Keyboard Navigation Hook (`src/hooks/useAccessibilityKeyboard.ts`, §10.2, INV-013)**:
   - Binds `A`/`B`/`C`/`D` selection, `Space`/`Enter` confirm, `ArrowLeft`/`ArrowRight` navigation, `F` flag, `P` palette toggle, `Esc` pause/close modal.
   - Smart input suppression inside text inputs and textareas.
3. **Accessible Focus Trap Manager (`src/lib/focusTrap.ts`, §10.2, INV-013)**:
   - Traps `Tab` key loops inside all 4 Phase 2 modals (`SubmitConfirmationModal`, `PauseOverlay`, `ExitModal`, `RetakeLauncher`) and restores trigger focus on close.
4. **Accessibility Styling & Reduced Motion (`src/index.css`, M4, M5)**:
   - 3px high-contrast focus outline (`:focus-visible`) with 2px offset (M4).
   - `@media (prefers-reduced-motion: reduce)` support disabling pulse animations (M5).
5. **Phase-Level Consolidated Master E2E Suite (`tests/e2e/mockExam-phase2.e2e.ts`, §10.4, H2)**:
   - Covers all 10 §10.4 critical paths + 11th a11y path (practice session, simulation deadline, pause/reload, crash recovery, clock tamper, offline exam + sync, retake overlap, Leitner injection, entitlement, multi-device, keyboard navigation).
6. **Accessibility Unit Test Suite (`tests/accessibility.test.ts`)**:
   - Tests focus trap signature, cleanup handlers, and screen reader timer announcement strings.

---

## 🏆 Phase 2 Final Invariants Audit (`INV-001` through `INV-025` All Passed)

| Invariant | Description | Verification Status |
|---|---|---|
| `INV-001` | Zero-Data-Loss Dexie v3 Migration | ✅ Verified (`tests/migrations.test.ts`) |
| `INV-002` | Section Distribution Pre-Flight Gate | ✅ Verified (`tests/preflight.test.ts`, `scripts/exam-preflight.ts`) |
| `INV-003` | Zero Intra-Exam Duplicate Items | ✅ Verified (`tests/selection.test.ts`) |
| `INV-004` | Deadline-Based Immutable Timer Math | ✅ Verified (`tests/timer.test.ts`) |
| `INV-005` | Local Answer Autosave $\le 5$ Seconds | ✅ Verified (`tests/persistence.test.ts`) |
| `INV-006` | Background Tab Auto-Submit on Deadline | ✅ Verified (`tests/e2e/mockExam-timer.e2e.ts`) |
| `INV-007` | Automatic Crash Recovery | ✅ Verified (`tests/persistence.test.ts`) |
| `INV-008` | Official CSC 80% Passing Cutoff (136 Pro / 132 SubPro) | ✅ Verified (`tests/scoring.test.ts`) |
| `INV-009` | Replay-Safe Injection Ledger Guard | ✅ Verified (`tests/leitnerInjection.test.ts`) |
| `INV-010` | Cognition-Aware Leitner Demotion & Default-Off Promotion | ✅ Verified (`tests/leitnerInjection.test.ts`) |
| `INV-011` | Tunable PRI Config Structure & Weight Sum | ✅ Verified (`tests/readinessIndex.test.ts`) |
| `INV-012` | Retake Overlap Minimization ($\le 30\%$) & Soft Cooldown | ✅ Verified (`tests/retakeManager.test.ts`) |
| `INV-013` | WCAG 2.1 AA Keyboard Navigation & Focus Traps | ✅ Verified (`tests/accessibility.test.ts`) |
| `INV-014` | WCAG 1.4.1 Colorblind-Safe Shape + Color Mappings | ✅ Verified (`tests/palette.test.ts`) |
| `INV-015` | Offline Exam-Taking & Background Sync Operations | ✅ Verified (`tests/e2e/mockExam-phase2.e2e.ts`) |
| `INV-016` | Single Active Non-Terminal Attempt Guard | ✅ Verified (`tests/persistence.test.ts`) |
| `INV-017` | Entitlement Pool Filtering & Gating | ✅ Verified (`tests/selection.test.ts`) |
| `INV-018` | Coalesced Remote Sync ($\le 1$ write per 30s) | ✅ Verified (`tests/syncCoalesce.test.ts`) |
| `INV-019` | Immutable Question Snapshot Isolation | ✅ Verified (`tests/scoring.test.ts`) |
| `INV-020` | Cross-Section Unrestricted Item Navigation | ✅ Verified (`tests/sessionStateMachine.test.ts`) |
| `INV-021` | Real Simulation vs Practice Mode Guards | ✅ Verified (`tests/sessionStateMachine.test.ts`) |
| `INV-022` | System Clock Tamper Anomaly Detection | ✅ Verified (`tests/timer.test.ts`) |
| `INV-023` | Cognitive Fatigue Stamina Deficit Warning ($\Delta \ge 0.15$) | ✅ Verified (`tests/fatigue.test.ts`) |
| `INV-024` | Emotional Stability PRI Delta Clamp ($|\Delta| \le 10$) | ✅ Verified (`tests/readinessIndex.test.ts`) |
| `INV-025` | Performance Budgets (Exam chunk <150KB gz, memoized palette) | ✅ Verified (`npm run build`) |

---

## ✅ Phase 3 Stage 3.1 — Metacognitive Error Pattern Self-Tagging Engine (100% Completed)
1. **Dexie Version 4 Schema Migration (`src/lib/db.ts`)**:
   - Upgraded database to Dexie v4 with `error_tags` table indexed on `[attempt_id+question_id]` and `[local_user_id+question_id]`.
2. **Error Pattern Domain & Repository (`src/lib/errorTags.ts`, `src/lib/errorTagRepository.ts`, INV-026)**:
   - Metacognitive taxonomy (`misread`, `conceptual`, `calculation`, `trap`, `rushed`, `guess`).
   - `computeDistribution()` math formula with 1-decimal rounding (`INV-026f`).
   - Repository CRUD operations (`upsertErrorTag`, `clearErrorTag`, `getAttemptDistribution`, `getGlobalDistribution`).
3. **Guest-to-Auth Merge Re-tagging (`src/lib/merge.ts`, INV-026i)**:
   - Re-tags `error_tags` on guest registration/login alongside attempts, journals, review states, and mock attempts.
4. **User Owned Tables Registry (`src/lib/userOwnedTables.ts`, §0.8.2)**:
   - Single source of truth registry mapping data policies (`browser_local_only`, `merge_on_auth`, `sync_remote`).
5. **Interactive UI Components**:
   - `ErrorTagSelector` (`src/components/ErrorTagSelector.tsx` & `.css`): 6-chip selector with EN/TL labels, disambiguation popovers, 48px touch targets, radiogroup role, and 280-char note input area.
   - `ErrorDistributionWidget` (`src/components/ErrorDistributionWidget.tsx` & `.css`): Attempt-level metacognitive breakdown bar chart on `/exam/:attemptId/results`.
   - `ErrorPatternSummary` (`src/components/ErrorPatternSummary.tsx` & `.css`): Dashboard teaser strip highlighting student's #1 error pattern.
6. **Unit Test Suites**:
   - `tests/userOwnedTables.test.ts`: Registry completeness unit tests.
   - `tests/errorTags.test.ts`: INV-026 pure math distribution & 1-decimal rounding unit tests.

---

## ✅ Phase 3 Stage 3.2 — Test Anxiety & Emotional Performance Toolkit (100% Completed)
1. **Dexie Version 5 Schema Migration (`src/lib/db.ts`)**:
   - Upgraded database to Dexie v5 with `worry_dumps` (`browser_local_only`) and `checklist_progress` (`merge_on_auth`) tables.
2. **Box Breathing 4-4-4-4 Math Engine (`src/lib/boxBreathing.ts`, INV-027c)**:
   - `phaseAt()` timing math anchored to `performance.now()` elapsed time (zero timer drift).
   - Reduced-motion accessibility support (`@media (prefers-reduced-motion: reduce)`).
3. **CSC Logistics & Requirements Checklist (`src/lib/cscExamChecklist.ts`, INV-027f)**:
   - Versioned items (`CSC_CHECKLIST_VERSION = 1`) covering NOSA, valid IDs, pencils, ballpen, attire, and venue rules.
   - `computeChecklistStats()` tracking required item readiness.
4. **Anxiety Toolkit Storage API (`src/lib/anxietyStorage.ts`, INV-027e)**:
   - On-device IndexedDB storage for worry dumps (never uploaded or logged to analytics).
5. **Interactive UI Component Suite**:
   - `BoxBreathingTimer` (`src/components/anxiety/BoxBreathingTimer.tsx` & `.css`): Visual breathing circle with Start/Pause/Reset controls and ARIA live announcements.
   - `WorryDump` (`src/components/anxiety/WorryDump.tsx` & `.css`): Text area with quick prompts, character count, and delete confirmation.
   - `ExamChecklist` (`src/components/anxiety/ExamChecklist.tsx` & `.css`): Interactive checklist with category filters and readiness progress bar.
   - `AnxietyHub` (`src/pages/AnxietyHub.tsx` & `.css`): Dedicated `/anxiety` page code-split into 14.37 kB chunk, with self-help medical disclaimer footer.
6. **Unit Test Suites**:
   - `tests/boxBreathing.test.ts`: INV-027c 4-4-4-4 cycle sequence & timing unit tests.
   - `tests/examChecklist.test.ts`: INV-027f checklist stats & mandatory items unit tests.

---

## ✅ Phase 3 Stage 3.3 — Full Statistics & Deep Analytics Hub Overhaul (100% Completed)
1. **Deep Analytics Engine (`src/lib/deepAnalytics/`, INV-028)**:
   - `buildStatisticsModel()` constructing complete analytics state from hydrated, snapshot-backed attempt & answer rows (`INV-028a`).
   - `computeSubtopicMastery()` with 4 heat bins (`insufficient_data`, `low`, `mid`, `high`) and $<3$ item neutral cell handling (`INV-028b/c`).
   - `computeSpeedAccuracyScatter()` mapping median time spent vs accuracy (`INV-028d`).
   - `computeStaminaProgression()` wrapping canonical `fatigue.ts` metrics for Q1–Q4 progression & `INV-023` alerts (`INV-028e`).
   - `computeCategoryRadar()` mapping 5 CSE subject domains against the official 80% passing cutoff (`INV-028f`).
   - `filterAttemptsByWindow()` supporting `last_30_mocks`, `last_90_days`, and `all_time` windows (`INV-028g`).
2. **Interactive UI Component Suite**:
   - `SubtopicHeatmap` (`src/components/statistics/SubtopicHeatmap.tsx` & `.css`): Category-grouped subtopic mastery grid with color and pattern badges.
   - `SpeedAccuracyScatter` (`src/components/statistics/SpeedAccuracyScatter.tsx` & `.css`): 4-quadrant pacing diagnostic with accessible data table.
   - `StaminaProgressionChart` (`src/components/statistics/StaminaProgressionChart.tsx` & `.css`): Q1 vs Q4 accuracy drop bars with `INV-023` alerts.
   - `CategoryRadar` (`src/components/statistics/CategoryRadar.tsx` & `.css`): 5-category mastery cards with 80% reference ring.
   - `ErrorTagBreakdown` (`src/components/statistics/ErrorTagBreakdown.tsx` & `.css`): Stage 3.1 metacognitive mistake self-tag distribution strip.
   - `StatsFilters` (`src/components/statistics/StatsFilters.tsx` & `.css`): Window filter selector bar.
   - `StatsEmptyState` (`src/components/statistics/StatsEmptyState.tsx` & `.css`): Zero-data friendly CTA card (`INV-028h`).
3. **Overhauled Deep Analytics Hub Page (`src/pages/Statistics.tsx`)**:
   - Composed analytics model with memoized `<100ms` sync calculation path (`INV-028i`).
4. **Unit Test Suites**:
   - `tests/analytics.mastery.test.ts`: INV-028b/c subtopic mastery unit tests.
   - `tests/analytics.scatter.test.ts`: INV-028d scatter point unit tests.
   - `tests/analytics.stamina.test.ts`: INV-028e stamina progression unit tests.
   - `tests/analytics.windows.test.ts`: INV-028g window filtering unit tests.

---

## ✅ Phase 3 Stage 3.4 — Entitlements, Free Tier Caps & Paywall Engine (100% Completed)
1. **Dexie Version 6 Schema Migration (`src/lib/db.ts`)**:
   - Upgraded database to Dexie v6 with `user_entitlements` table (`merge_on_auth`).
2. **Entitlement & Quota Checking Engine (`src/lib/entitlements.ts`, INV-029)**:
   - `FREE_TIER_LIMITS`: Max 1 completed simulation exam, max 3 daily practice sessions (`INV-029a`).
   - `filterQuestionsForUser()`: Gates question pool for free users to `is_free === true` items.
   - `redeemCoupon()`: Case-insensitive coupon engine supporting pre-seeded codes (`GABAYPRO2026`, `PASSER2026`, `CSC2026`, `DEV100`, `INV-029d`).
   - `upgradeToPremium()`: Upgrades user status via GCash / Maya checkout flow.
3. **Guest-to-Auth Merge Re-tagging (`src/lib/merge.ts`, INV-029f)**:
   - Re-tags `user_entitlements` on guest-to-auth merge so learners never lose acquired Pro status.
4. **React Entitlement Hook (`src/hooks/useEntitlement.ts`)**:
   - Custom hook exposing live entitlement status and quota checking helpers.
5. **Paywall Modal UI (`src/components/paywall/PaywallModal.tsx` & `.css`, INV-029c)**:
   - Accessible modal featuring ₱299 lifetime pass pricing, GCash / Maya checkout buttons, coupon redemption input, and focus trap.
6. **Question Selection Gating (`src/lib/questionSelection.ts`)**:
   - Gated priority ladder to entitlement-filtered question pool.
7. **Unit Test Suite**:
   - `tests/entitlements.test.ts`: Free tier limits, question bank gating, and coupon code redemption unit tests.

---

## ✅ Phase 3 Stage 3.5 — Phase 3 Master Verification & Final Sign-Off (100% Completed)
1. **Master Playwright E2E Suite (`tests/e2e/phase3-master.e2e.ts`)**:
   - Covers all 7 Phase 3 critical paths (error self-tagging, box breathing, worry dump, exam checklist, deep analytics hub, paywall modal & coupon redemption, guest-to-auth merge).
2. **Master Phase 3 Report (`docs/phase3/PHASE_3_COMPLETION_REPORT.md`)**:
   - Formal sign-off documenting invariants `INV-026` through `INV-029`, database schema migrations (v4, v5, v6), and unit test verification (28/28 suites green).

---

## 🏆 Phase 3 Final Invariants Audit (`INV-026` through `INV-029` All Passed)

| Invariant | Description | Verification Status |
|---|---|---|
| `INV-026` | Metacognitive Error Pattern Self-Tagging Engine | ✅ Verified (`tests/errorTags.test.ts`, Dexie v4) |
| `INV-027` | Test Anxiety & Emotional Performance Toolkit | ✅ Verified (`tests/boxBreathing.test.ts`, `tests/examChecklist.test.ts`, Dexie v5) |
| `INV-028` | Full Statistics & Deep Analytics Hub Overhaul | ✅ Verified (`tests/analytics.*.test.ts`) |
| `INV-029` | Entitlements, Free Tier Caps & Paywall Engine | ✅ Verified (`tests/entitlements.test.ts`, Dexie v6) |

> **⚠️ NOTE FOR AUDITORS**: We officially pivoted the business model away from "consumable" mock exam passes in favor of a simpler Time-Gated/Lifetime Pro Pass model. As such, the original Phase 4 requirements for `consume_mock_pass` and `get_pass_status` Edge Functions are intentionally omitted as obsolete. The client natively manages offline entitlement grace periods via Dexie's `user_entitlements` table synced through Supabase.

---

## ✅ Phase 3 Exit Gate — Production Security & Compliance (100% Completed)
1. **Supabase Edge Functions (`supabase/functions/`)**:
   - `create-checkout`: Integrates PayMongo API to generate checkout sessions linked to user IDs. Included robust CORS handling (`Access-Control-Allow-Origin: *`).
   - `paymongo-webhook`: Handles asynchronous `checkout_session.payment.paid` webhooks, verifying signatures and securely issuing the `PRO_PASS` entitlement to the user's Supabase record.
2. **Postgres Row Level Security (RLS) & Triggers (`supabase/migrations/`)**:
   - `20260720000000_create_entitlements.sql`: Created `user_entitlements` table with RLS enforcing read-only access for the owner, while allowing Edge Functions full mutation privileges via Service Role key.
3. **Frontend API Integration (`src/lib/paymongoClient.ts`)**:
   - Replaced mock checkouts with real Supabase Edge Function invocations for `createCheckoutSession`.
4. **Build Security Scanners (`scripts/assertNoSecretsInBundle.ts`)**:
   - Implemented a pre-build scanner that aggressively scans the `/dist` bundle for leaked `PAYMONGO_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` and halts CI if found.
5. **Legal & Privacy Policies (`docs/legal/`)**:
   - Drafted `privacy.md` and `terms.md` specific to Philippine data laws (DPA) and digital product refunds for solo developers.

---

## ✅ Phase 4 — Production Deployment (100% Completed)
1. **Vercel Infrastructure (`vercel.json`, `.nvmrc`)**:
   - Configured Vite SPA rewrites (`/(.*) -> /index.html`).
   - Hardened `Content-Security-Policy` allowing only Supabase, PayMongo, PostHog, Google Fonts, and Sentry.
   - Pinned Node.js v20 LTS.
2. **GitHub Actions CI/CD (`.github/workflows/ci.yml`)**:
   - Automated testing, linting, type-checking, building, and the Phase 3 secret scanner on every push to `main`.
3. **Error & Analytics Monitoring (`main.tsx`, `vite.config.ts`, `PaywallBanner.tsx`)**:
   - Integrated `@sentry/react` for runtime crash reporting and SourceMap upload handling.
   - Added specific PostHog tracking events for `upgrade_clicked` and `checkout_started`.
4. **Legal Pages UI (`src/pages/PrivacyPolicy.tsx`, `src/pages/TermsOfService.tsx`)**:
   - Fully interactive React components displaying the legal markdown content.
   - Added footer links to the Welcome screen.

---

*(Phase 3, Phase 3 Exit Gate & Phase 4 Full Execution Completed Successfully).*
