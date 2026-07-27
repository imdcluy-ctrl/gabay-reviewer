# QOTD → Streak Mode + Readiness Algorithm Rewrite

**Status:** Ready to execute
**Owner:** Product + Engineering
**Version:** 2.0 (synthesized — incorporates final review round)
**Last revised:** 2026-07-27
**Source inputs:** Original plan + two rounds of AI review + final gap analysis

---

## 0. Executive Summary

Two distinct problems, two phases:

1. **Engagement/UX (Phase A).** The current "Question of the Day" is a random bank question in study-session format — no hook to return. We replace it with a short, addictive **Streak Mode** game on the existing question bank (244 free / 2905 pro).
2. **Product/logic/legal risk (Phase B).** The current readiness algorithm requires only 30 questions, assumes a 50% Bayesian prior, uses only study attempts (ignoring mocks and short tests), has no category-coverage check, and claims "You are on track to PASS" — a legally risky guarantee.

Work is decomposed into **phases → batches → micro-batches**. Every micro-batch is self-contained, compilable, and testable.

### What v2.0 adds (vs. v1.1)

| Change | Lands in |
|---|---|
| Baseline QOTD instrumentation ships with B0 (else Phase A metrics are unmeasurable) | B0.4 |
| B0 copy reframed from *predictive* to *descriptive* (facts about progress, not pass-likelihood) | B0.1 |
| Recency decay added to scoring — stale evidence decays via exponential half-life | B1.2 |
| Prior rationale corrected: 25% is defensible because it is *conservative*, not because it "equals the guess rate" | B1 (params) |
| B4 validation gains a feasibility fallback: held-out mock exams as proxy ground truth | B4.1 |
| Question-selection blend ratios specified (resolves weak-weighting vs. anti-frustration tension) | A1.2 |
| Clock/timezone semantics + one-time courtesy streak-restore policy | A1.1, A3.2 |
| Daily session defined as a formal state machine; freeze economy decisions enumerated | A1.3 |
| Free-pool exhaustion endgame behavior decided | A0.1 |
| Category-gate sanity check + shared taxonomy with Streak Mode picker | B1 params |

---

## 1. Sequencing Strategy

1. **Ship B0 (Legal Fast-Patch + baseline instrumentation) first.** Copy-only fix + analytics, ~1–2 days, zero dependency on the Bayesian rework. Removes live liability and establishes the Phase A baseline.
2. **Phase A (Streak Mode) runs in parallel** with the rest of Phase B. Fun, low-risk, zero technical dependency on Phase B.
3. **Phase B algorithmic work (B1→B2→B3→B4)** proceeds alongside.

```text
Timeline (parallel tracks):
  Track 1 (Live-risk):   B0 ──► (done early; includes baseline instrumentation)
  Track 2 (Fun/Engage):  A1 ─► A2 ─► [Review & Test] ─► A3 ─► A4
  Track 3 (Core/Risk):   B1 ─► B2 ─► [Review & Test] ─► B3 ─► B4
```

**Coupling note:** A1.2 (weak-category weighting) and B1 (category taxonomy) must share one category taxonomy. Define the taxonomy once, in B1.1, and have A1.2 consume it via interface — A1.2 ships with a random/weighted-unseen fallback until B1 data exists.

---

## 2. Phase A — Replace QOTD with "Streak Mode"

### A0. Why Streak Mode

- Simplest possible concept: answer correctly, build a streak. One wrong answer (without a freeze) resets it.
- Proven addictive mechanic (Flappy Bird, Crossy Road, Wordle): instant stakes, fast restart.
- Directly tied to learning: answering correctly *is* the game.
- Reuses the existing bank (244 free / 2905 pro). Zero new dependencies, minimal UI.

### A0.1 Product decisions (resolved)

| Decision | Resolution |
|---|---|
| Daily vs. endless | **Daily once-a-day scored attempt** (true QOTD replacement), with a `today_used` state resetting on day boundary (see clock semantics, A1.1). Endless practice mode is out of scope for v1. |
| Question selection | **Blend:** ~50% unseen, ~25% weak-category, ~25% spaced review of previously-missed. Weak-weighting is deliberately *mild* — dominant weak-weighting contradicts the anti-frustration mechanics (freeze/cap). Falls back to weighted-unseen/random when no weakness data exists. |
| Anti-farming | "Recently used" 14-day cooldown ring buffer; no repeats within the window. |
| Free → Pro trigger | Upgrade prompt when unseen free pool is exhausted (≈49 days of perfect daily play at 5/day — a deliberately designed window) or at streak milestones. |
| Free-pool exhaustion endgame | If the user declines upgrade: **recycle oldest cooldown questions** (streak continues on repeat content) rather than hard-stopping. Hard stop punishes exactly the most-engaged free users. |
| Rage-quit mitigation | **Streak Freeze** (Duolingo-style): survive one wrong answer per freeze. Daily scored session ends at **5 correct** (day "banked") — a single brutal question can't nuke a long streak. |
| Crash safety | Streak state persisted server-side (durable store); app crash mid-run never silently loses a streak. |

### A0.2 Open product decisions (close before A1 tickets are written)

1. **Freeze economy:** earn rate (e.g., 1 freeze per 7-day streak?), max inventory (suggest 2), **auto-apply vs. opt-in** (recommend auto-apply — reduces anxiety), and whether inventory is a free/pro differentiator (monetization decision, not engineering).
2. **Post-failure practice:** after a failed scored session, may the user keep practicing unscored that day? (Recommend yes — engagement without streak risk.)
3. **A4 target values:** X%/Y% to be filled from the B0.4 baseline, **pre-registered before A3 launch** so targets aren't back-fit to observed numbers.

### Batch A1 — Game Engine (back-end)

| Micro | What |
|---|---|
| A1.1 | **Data model & state management:** `streak`, `today_used`, `freeze_count`, `recently_used[]` (14-day ring buffer), `last_active_day`. Durable, crash-safe persistence. **Clock semantics:** server-authoritative timestamp mapped to the user's stored home timezone (IANA tz database, DST-safe); day boundary = local midnight of home tz; never recompute past days retroactively on travel (prevents travel-timezone streak loss). |
| A1.2 | **Question selection service:** 50/25/25 blend (unseen / weak-category / spaced review), 14-day repeat-avoidance cooldown, free-pool exhaustion detection (triggers upgrade hook), taxonomy consumed from B1.1 interface, fallback to weighted-unseen when no weakness data. |
| A1.3 | **Core game logic as a formal state machine** (see below). Enforce: 5-correct daily cap, `today_used` gate, freeze auto-consume on wrong, streak reset on wrong-without-freeze. Idempotent answer evaluation. |
| A1.4 | **API surface:** `start-session`, `submit-answer`, `get-streak`, `use-freeze` (if opt-in), `reset-day`. Idempotent and testable. |

**A1.3 session state machine (recommended default — confirm against A0.2):**

```text
IDLE ──start (not today_used)──► IN_SESSION ──5th correct──► DAY_BANKED ──► IDLE (today_used)
                                    │                          └─ further questions: unscored practice
                                    ├─wrong + freeze──► FREEZE_APPLIED ──► IN_SESSION (streak intact)
                                    │
                                    └─wrong, no freeze──► DAY_FAILED ──► IDLE (today_used, streak = 0)
                                                              └─ further questions: unscored practice
```

Wrong on question 1 behaves identically to wrong on question 4 — no special-casing. `DAY_BANKED` means the streak increment is locked in; nothing the user does afterward today can lose it.

### Batch A2 — Game UI (front-end)

| Micro | What |
|---|---|
| A2.1 | Game screen: one-question-at-a-time, immediate correct/incorrect feedback, visible live streak counter. |
| A2.2 | Daily gate UI: "Come back tomorrow" / "Today's streak complete" when `today_used`. |
| A2.3 | Freeze UI: freeze count display, auto-apply confirmation/recovery affordance (or opt-in prompt per A0.2). |
| A2.4 | Free → Pro prompt: upgrade CTA on pool exhaustion or streak milestone. |

### [Review & Test] — after A2

QA, edge cases, and analytics instrumentation for Streak Mode: streak start rate, daily completion rate, freeze usage, repeat-question complaints, free→pro conversion from exhaustion. **Verify the B0.4 baseline is collecting** before launch.

### Batch A3 — Retention Mechanics (the "addictive" half)

*The core loop is not what makes streaks sticky; the infrastructure around it is.*

| Micro | What |
|---|---|
| A3.1 | Push notifications: "Don't lose your streak" / "Your streak is at risk" / daily reminder. Respect quiet hours; prompt for push permission at the moment of highest intent (after first banked day). |
| A3.2 | Streak persistence & recovery: durable cross-device streak, freeze earn/restore paths, grace-period affordance, **one-time courtesy streak restore** per user via support tool (log for abuse). |
| A3.3 | Dashboard streak counter: always-on visible indicator on home/dashboard. |
| A3.4 | Leaderboard (optional v1.1): friends/cohort leaderboard, gated behind privacy review. |

### Batch A4 — Metrics & Success Criteria

| Metric | Target |
|---|---|
| D1 retention (return next day after first streak) | ≥ X% vs. old QOTD baseline *(from B0.4, pre-registered)* |
| Daily active streak participation | ≥ Y% of active users *(pre-registered)* |
| Median streak length | Increasing MoM |
| Free→Pro conversion via streak exhaustion | Measure & iterate |

---

## 3. Phase B — Readiness Algorithm Rewrite

### Batch B0 — Legal Fast-Patch (ship first)

Minimal, isolated, ~1–2 day fix removing live liability **before** the full rewrite.

| Micro | What |
|---|---|
| B0.1 | **Reframe copy from prediction to description.** Remove "You are on track to PASS." Interim messages state facts only — e.g., "You've answered 120 questions at 74% accuracy across 6 of 8 categories." No pass-likelihood language at all until B4 validates the model; even softened predictive copy ("likelihood of passing") is an unvalidated claim today. |
| B0.2 | Ship behind feature flag / quick release. Copy-only; no algorithm change. |
| B0.3 | Route final language through compliance/legal review — copy is not engineering-authored. |
| B0.4 | **Baseline QOTD instrumentation ships in the same deploy** (current QOTD participation, D1 return, session depth). Without this, A4's "vs. baseline" targets are unmeasurable. |

### Batch B1 — Core Algorithm

**Parameter spec:**

| Parameter | Value | Rationale |
|---|---|---|
| Min questions | **100** (up from 30) | 30 cannot predict readiness for a high-stakes exam; 100 is a defensible floor. Tune via B4 backtest. |
| Bayesian prior | **25%** | Chosen because it is *conservative* — a pessimistic starting point that real data must override. (Note: the correct rationale is conservatism, **not** "equals the 4-option guess rate" — a prior over latent readiness and a per-question guess probability are different quantities, and the guess-rate framing will not survive legal/compliance scrutiny.) |
| Study weight | **1×** — per question | Baseline signal. |
| Short test weight | **2×** — per question | More deliberate than passive study. Applied per-question, not per-session. |
| Mock exam weight | **3×** — per question | Simulates test-day pressure; strongest signal. Per-question so a 100-q mock doesn't dwarf a 10-q study session purely by volume. |
| Recency decay | **Exponential half-life on event weight** (initial ~90 days; tune in B4.2) | Without decay, 6-month-old evidence counts the same as yesterday's — unacceptable for a readiness claim. Also mitigates single-heavy-mock domination. |
| Session dominance guard | **Cap: no single session contributes > ~25% of total weighted evidence** (evaluate in B4.2) | Prevents one strong mock from single-handedly producing a "ready" classification. |
| Min categories | **≥ 1 attempt in 80% of categories** | Coverage gate before any score is shown. **Pre-req: sanity-check N** — 80% of 5 categories ≠ 80% of 40; confirm the taxonomy and that A1.2 consumes the same one. |
| Pass language | **Descriptive until B4 validates; statistical-likelihood tiers after** (never a guarantee) | See B0.1 for interim; likelihood tiers in B3.1 go live only post-B4. |

**Micro-batches:**

| Micro | What |
|---|---|
| B1.1 | **Readiness data model & interface:** unified event schema across study / short test / mock with category tags and **event timestamps** (required for decay and for B4's train/holdout split). Defines the shared category taxonomy consumed by A1.2. |
| B1.2 | **Core scoring:** Bayesian update (prior 25%), per-question source weights (1×/2×/3×), recency decay with half-life parameter, session-dominance cap, category-coverage gate. |
| B1.3 | Mock exam data integration (3× weight source). |
| B1.4 | Short test data integration (2× weight source). |
| B1.5 | Confidence intervals & message tiers: wide intervals early (prior dominates), narrowing as data overrides the 25% prior. Tiers map to likelihood language (legal-reviewed, dark until B4). |

### Batch B2 — Dashboard Integration

| Micro | What |
|---|---|
| B2.1 | Cold-start / "Not Enough Data Yet" state — graceful placeholder, never a scary "0% Ready" before minimums. |
| B2.2 | Score + CI display: readiness %, confidence interval, category coverage progress. |
| B2.3 | Category coverage UI: which categories still need attempts (feeds A1.2 weak-category weighting). |
| B2.4 | Rollout discontinuity handling: gradual rollout / in-app comms so existing users' scores don't shock-jump (e.g., 80% → 40%) without explanation. Show old → new with rationale copy. |

### [Review & Test] — after B2

QA, edge cases, and readiness instrumentation: complaint volume, legal-exposure tickets, score stability.

### Batch B3 — Legal Safeguards

| Micro | What |
|---|---|
| B3.1 | Message-tier taxonomy: likelihood tiers (low / moderate / high) with compliant copy. **Dark until B4 validates.** |
| B3.2 | No-guarantee enforcement: static checks / lint to prevent "will pass / guaranteed" strings re-entering the codebase. |
| B3.3 | Compliance review pass: final language reviewed by legal/compliance, A/B-tested for clarity. Copy = statistical likelihood, never predictive guarantee. |

### Batch B4 — Validation & Backtest

*Don't just trade one unvalidated heuristic for another.*

| Micro | What |
|---|---|
| B4.1 | **Historical backtest — two tiers by data availability:** (a) if real, anonymized exam outcomes linked to users exist → correlate the "pass/likely" classification against them; (b) **fallback: held-out mock as proxy ground truth** — train the score on study + short-test events only, then test whether the classification predicts held-out final-mock performance (mocks are our best in-app exam proxy). **Confirm which tier applies before writing B4 tickets.** Tune min-questions, prior, weights against whichever applies. |
| B4.2 | **Parameter sensitivity:** confirm prior + weights + decay produce stable, non-pessimistic scores as volume grows; tune decay half-life; evaluate the session-dominance cap. |
| B4.3 | **Rollout guardrails:** monitor score-shift distribution post-launch; alert if median shift exceeds threshold (triggers the B2.4 comms plan). |

---

## 4. Cross-Cutting: Instrumentation & Success Criteria

Neither phase treats "shipped" as "done."

| Phase | Success metric | Definition |
|---|---|---|
| A (Streak) | Engagement lift vs. old QOTD | D1 return rate, daily participation %, median streak length, free→pro conversion. **Baseline must exist (B0.4) before A3 launch.** |
| B (Readiness) | Risk reduction + accuracy | Drop in legal/complaint tickets about "guaranteed pass"; backtest correlation with real outcomes (or held-out-mock proxy); smooth, communicated score transitions. |

---

## 5. Batch & Micro-Batch Inventory

| Phase | Batches | Micro-batches |
|---|---|---|
| **A — Streak Mode** | A1 Engine, A2 UI, [Review & Test], A3 Retention, A4 Metrics | A1.1–A1.4, A2.1–A2.4, A3.1–A3.4, A4 |
| **B — Readiness** | B0 Fast-Patch, B1 Core, B2 Dashboard, [Review & Test], B3 Legal, B4 Validation | B0.1–B0.4, B1.1–B1.5, B2.1–B2.4, B3.1–B3.3, B4.1–B4.3 |

Every micro-batch is self-contained, compilable, and testable.

---

## 6. Pre-Execution Spec Checklist

Close these **before** the relevant batch's tickets are written:

**Before A1:**
- [ ] A0.2 decisions: freeze earn rate / inventory cap / auto-apply / free-vs-pro freeze differentiation
- [ ] A0.2 decision: unscored post-session practice allowed? (recommended: yes)
- [ ] Category taxonomy source-of-truth agreed with B1 (shared interface)

**Before B1:**
- [ ] B4 tier confirmed: do real linked exam outcomes exist, or do we commit to the held-out-mock proxy?
- [ ] Category count sanity check (80% of N is feasible)
- [ ] Decay half-life initial value (recommend ~90 days)
- [ ] B0.1 descriptive copy approved by legal

**Before A3 launch:**
- [ ] B0.4 baseline verified collecting
- [ ] A4 target values pre-registered from baseline

---

## 7. Immediate Next Steps

1. **Start B0 now** — descriptive-copy patch (B0.1–B0.3) + baseline instrumentation (B0.4) in one quick release.
2. **Kick off A1 in parallel** — fun, fully decoupled from Phase B.
3. Fill micro-batch tickets from the tables above once the Section 6 checklist items are closed.

*Ready to execute.*
