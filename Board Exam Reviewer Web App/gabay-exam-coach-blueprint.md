# GABAY — AI Exam Coach Platform
### Product & Technical Blueprint v2 (Second-Opinion Revision)
*"Gabay" (Filipino: guide/companion) — working name, rename freely.*

Prepared for handoff to Gemini Antigravity Desktop. This is a build spec, not marketing copy — every section is meant to be actionable by an AI coding agent or a human developer.

---

## 0. What This Revision Changes From the First Draft

The first draft (from Gemini) nailed the low-cost serverless architecture and the abstract exam schema. Both are kept. What's added here, based on your own instinct plus a pass of research on learning science and existing PH exam apps:

1. **A real timeline reality-check** — your wife's exam is August 9, 2026. That is **~3 weeks from today**. Section 3 addresses this directly, because the original plan implicitly assumed more runway.
2. **A 5-layer pedagogical engine** instead of a 4-part explanation card — adds a *guided-hint ladder* (Socratic scaffolding) before the answer is ever shown, a *big-picture "why this section exists"* primer, a *personal journal/anchor notes* layer, and a *spaced-repetition review queue*.
3. **A competitive gap analysis** — existing CSE apps in the Philippines are almost all quiz banks (practice mode, timed mode, mock exam, analytics). None of the ones found coach the *thinking process*. That gap is your moat.
4. **A cost-control note on AI usage** — precompute explanations and hint ladders once at content-creation time; don't call an LLM live per student interaction, or your margins disappear at scale.

---

## 1. Vision & Non-Negotiables

**Mission (in order of priority):**
1. Help a Filipino examinee genuinely learn how to *think through* a question — not memorize a question bank.
2. Build something that scales to any board/civil exam without rewriting the engine.
3. Make it profitable enough to sustain and grow.

**Non-negotiables for whoever builds this:**
- The app is a **coach**, not a quiz machine. Every question interaction should feel like someone is walking beside the user, not grading them from a distance.
- The system never reveals the final answer as the *first* response to a wrong or uncertain attempt. It offers a hint ladder first (see Section 5.2).
- Every exam, category, and subtopic is a **data row, not hardcoded logic** — adding LET or a board exam next year should be a content task, not a development task.
- Explanations cover **every option**, not just why the correct one is correct (this is the single habit that separates effective question banks like UWorld from ordinary ones).

---

## 2. Why Now — Market Reality Check

- The CSC has confirmed the **Career Service Examination – Pen and Paper Test (CSE-PPT)** for both Professional and Sub-Professional levels is scheduled for **Sunday, August 9, 2026**, nationwide.
- This is a genuinely massive, recurring, high-stakes market: the August 2025 sitting alone drew **over 331,000 examinees**, and the Professional level's passing rate averages only **10–12%**. Most people who take it do not pass. That is not a small addressable market with a ceiling problem — it's a huge market with a *quality-of-preparation* problem.
- Exam structure (confirm against the CSC's official announcement closer to launch, but current figures are):

| Level | Items | Time Allotted | Passing Score | Sections |
|---|---|---|---|---|
| Professional | 170 | 3 hrs 10 min | 80% | Verbal Ability, Numerical Ability, Analytical Ability, General Information |
| Sub-Professional | 165 | 2 hrs 40 min | 80% | Verbal Ability, Numerical Ability, Clerical Ability, General Information |

- Physical reviewer books run ₱300–500 on Shopee; review centers charge ₱1,500–10,000; existing apps charge ₱249–499/month. Your pricing sits comfortably inside that range (Section 10).

### Existing competitor landscape (what's already out there)
Searching the current app stores and web turns up several Philippine CSE reviewer apps and sites (e.g. "Civil Service Reviewer," "CSE Exam Reviewer," "Civil Service Exam Reviewer PH," topnotcher.ph, civilservicereviewerph.com). Their feature sets converge on the same formula:
- Practice mode (untimed, instant feedback)
- Timed mode
- Mock exam simulator
- Progress tracking / analytics by category
- A large, "constantly updated" question bank

**None of them advertise:** guided reasoning before the answer is shown, explanations for wrong options individually, a "why this section exists" framing, personal note-taking tied to a question, or a spaced-repetition review system. That is your entire differentiation. You are not competing on question count — you are competing on *how well someone understands what they just answered*.

---

## 3. Honest Timeline Check — Please Read Before Planning Sprints

Today is **July 18, 2026**. The August 9, 2026 exam is **22 days away**. Building a production-quality content engine (1,000+ questions, each with a full 5-layer explanation, QA-reviewed) plus a working MVP in three weeks is not realistic if you want the *quality bar* that makes this worth building at all. A rushed version would just become another mediocre quiz app — the exact thing you're trying to not build.

**Recommended reframe of this cycle:**

- Treat the **August 9, 2026 sitting as a free, built-in research phase**, not a launch deadline.
- Your wife is about to become your single best source of primary market research. Ask her to keep a simple running log (a notes app, a notebook, whatever's fastest) of:
  - Every question type that confused her and *why* — was it the wording, the math setup, the assumed background knowledge?
  - Which review materials she used and what she found unclear or too dense.
  - What she wished someone had explained differently.
- This log becomes real seed content for your "Choice Killer" and "Next-Time Rule" explanations later — it is far more valuable than guessing what confuses people.
- **Target a real launch for the March 2027 CSE-PPT cycle instead.** That gives you ~7–8 months, which comfortably fits the roadmap in Section 11: content first, then MVP, then a proper beta with real users, ahead of a real exam date — not a rushed one.

This isn't a reason to slow down starting — it's a reason to spend the next three weeks on research and content-blueprinting rather than trying to ship code.

---

## 4. The Core Differentiator: Coach, Not Quiz Bank

| Dimension | Typical PH exam app today | Gabay |
|---|---|---|
| Answer feedback | Right/wrong + one explanation for the correct choice | Right/wrong + explanation for **every** option, including why each wrong one is tempting |
| Getting to the answer | Shown after you submit | A hint ladder offered *before* the answer, so the user still does the thinking |
| Framing | "Here are 170 questions" | "Here's why this section exists and what it's actually testing about you" |
| Retention | Score history, category %s | Spaced-repetition review queue that resurfaces exactly the items you're forgetting |
| Personalization | None beyond analytics | A personal journal/notes layer attached to each question, that follows the user into later review sessions |
| Growth path | Single exam, hardcoded | Abstract exam/category/subtopic schema — new exam = new content rows |

---

## 5. The Pedagogical Engine (5 Layers)

### 5.1 — Before Practice: "Why This Section Exists" Primer

Before a user starts a category for the first time, show a short, plain-language explainer of *what the government is actually trying to measure* with that section — not just "these are the topics." This gives meaning to otherwise arbitrary-feeling drills, which research on deep processing has long shown improves both motivation and recall (information processed for meaning is retained far better than information processed at a surface, rote level).

Starter copy you can use directly (rewrite in Duane's own voice as needed):

- **Verbal Ability:** "This isn't testing whether you're a grammar expert. It's checking whether you can read a memo or directive and know exactly what it's asking — because miscommunication in government doesn't just look bad, it delays a public service or misinforms someone."
- **Numerical Ability:** "You won't be doing calculus at your desk. But you will be asked to check a disbursement voucher, split a budget, or notice when a report's math doesn't add up. This section checks: can you catch an error before it becomes a problem?"
- **Analytical Ability (Professional only):** "Government decisions often start from incomplete information. This checks if you can reason from limited premises to a valid conclusion — the same skill needed to evaluate a proposal or investigate a complaint."
- **Clerical Ability (Sub-Professional only):** "Filing, spelling, and spotting small errors sounds unglamorous, but almost every service delay in government traces back to a misfiled record or a typo. This checks whether you can be trusted with the paper trail."
- **General Information:** "This is the one section that isn't about skill — it's about identity. The Constitution, RA 6713, and civic history are the value system you're about to swear into. This checks whether you understand the boundaries and duties of being a public servant before you become one."

### 5.2 — During a Question: The Guided Hint Ladder (Socratic Scaffold)

This is the centerpiece feature. When a user is stuck (or answers incorrectly and wants to retry before seeing the explanation), they can tap **"Guide me"** instead of **"Show answer."** Each tap reveals one more rung of the ladder — never the answer outright, until the last rung:

1. **Rung 1 — Name the pattern:** "This is a [Ratio and Proportion / Subject-Verb Agreement / Syllogism] question wearing a [salary distribution / office memo / hiring policy] costume."
2. **Rung 2 — Strip the noise:** Show the sentence or problem with filler words grayed out, leaving only the values/clauses that matter.
3. **Rung 3 — Kill one wrong option:** Eliminate the single most obviously wrong choice and explain the trap it represents.
4. **Rung 4 — Near-answer nudge:** A pointed question that all but hands them the method, without stating the final number/choice. ("If you convert those minutes to hours first, what do you get?")
5. **Reveal:** Full answer + the 4-part Deconstruction Card (5.3).

This mirrors how research on effective AI and human tutoring describes good scaffolding: give more direct hints when someone is stuck, step back and ask harder questions when they're closer, and let the learner self-correct rather than being told the answer outright. It also matches what "productive struggle" research consistently finds — a learner who fights for the answer a little longer retains the method far better than one who is handed it immediately.

Design rule: **the user is always allowed to just answer without any hints.** The ladder is opt-in support, never a forced gate.

### 5.3 — After Answering: The Deconstruction Card (4 parts, applied to every option)

Same spine as the original draft, but explicitly extended to cover *all* answer choices, not just the correct one — this is the single habit that top-tier question banks credit for their reputation, because a wrong choice you don't understand is a trap you'll fall into again on test day:

1. **Blueprint ID:** What is this question actually testing underneath the surface wording?
2. **Deconstruct:** Strip the noise, isolate the core values/clauses.
3. **Choice-by-Choice:** For the correct option, why it's right. For **each** wrong option, name the specific trap or misconception it represents (not just "this is wrong").
4. **Next-Time Rule:** One portable sentence that applies to any variation of this question type.

### 5.4 — The Personal Journal / Anchor Notes

Attach a lightweight note field to every question a user has answered. This is the feature you described as journaling/commenting — it should feel like margin notes in a physical reviewer, not a separate app section.

- After seeing the Deconstruction Card, the user can jot their own one-line takeaway, mnemonic, or "why I got this wrong" note.
- These notes resurface automatically the next time that question (or its subtopic) appears in a review session — the user sees their *own* words before the system's explanation, which strengthens recall (self-generated explanations are consistently one of the more effective, if underused, study techniques).
- Over time this becomes a personal "why I keep messing this up" anchor log per subtopic — genuinely useful for the final week before an exam.

### 5.5 — Retention Layer: Spaced Review Queue

Keep this deliberately simple for an MVP rather than building a full SM-2/Anki-style algorithm (which is over-engineering for a lightweight goal). A **Leitner-box style system** is enough:

- Every answered question is tagged with a "box" (1 to 5).
- Correct + confident → moves up a box (reviewed less often).
- Wrong, or correct-but-unconfident → drops back to box 1 (reviewed again soon).
- A daily/weekly "Review Queue" screen pulls whatever is due today across all subtopics, mixed together.

This isn't a nice-to-have — the research consensus (a large meta-analysis covering over 169,000 participants across 242 studies) is that **distributed/spaced practice combined with practice testing are the two most effective study techniques measured**, ahead of nearly everything else tested, including highlighting, re-reading, and summarizing.

### 5.6 — Interleaved Mixed Drills

Once a user has some base coverage, offer a mode that deliberately mixes categories/subtopics in one session instead of drilling one topic in a block. Research on interleaving (spacing this out across STEM and professional-exam contexts) consistently shows it improves the ability to *tell question types apart* on a real exam, where categories aren't announced in advance — which is exactly the CSE-PPT format.

### 5.7 — Confidence Check (Metacognition)

Before revealing whether an answer was right, ask a quick "How sure were you?" (1–5). Over time this teaches the user to notice the gap between feeling sure and actually being right — a well-documented failure mode under exam pressure — and gives your analytics a much more useful signal than raw accuracy alone (a user who is "confidently wrong" on a subtopic needs different intervention than one who is "unsure and wrong").

---

## 6. Science-to-Feature Map (quick reference)

| Feature | Learning-science basis |
|---|---|
| Practice questions with immediate feedback | Retrieval practice / testing effect |
| Spaced review queue (Section 5.5) | Distributed/spaced practice — the single most consistently supported study technique in meta-analyses |
| Interleaved mixed drills (5.6) | Interleaving effect — improves discrimination between problem types |
| Explaining every wrong option (5.3) | Elaboration + error-based learning; mirrors the explicit practice of top-tier question banks like UWorld |
| Guided hint ladder before answer reveal (5.2) | Socratic scaffolding / productive struggle — direct-answer AI tutoring has been shown in comparative studies to encourage passive, surface-level engagement versus scaffolded questioning |
| Personal journal notes (5.4) | Self-explanation / generation effect |
| Confidence check (5.7) | Metacognitive calibration |
| Big-picture primers (5.1) | Depth-of-processing — meaning-based encoding beats rote encoding |

---

## 7. System Architecture

Keep the original serverless spine — it's the right call for near-zero fixed cost and effortless traffic spikes (exam-day and results-day surges are exactly when a traditional server would fall over):

| Layer | Stack | Why |
|---|---|---|
| Frontend UI | Next.js / React (or Vite), hosted on Vercel or Netlify | Static, CDN-distributed — thousands of concurrent users cost the same as one |
| Backend & Auth | Supabase or Firebase | Generous free tiers, scales automatically, no server to babysit |
| Offline buffering | Client-side state (Zustand/local state) synced back on reconnect | Handles the very real "jeepney wifi dropped mid-quiz" scenario |
| **AI Content Layer (new)** | Claude/Gemini API used **at content-creation time**, not at runtime | Generate first drafts of hint ladders, choice-by-choice explanations, and big-picture primers in bulk, then have a human (Duane or an SME) review/edit before publishing. This keeps per-user runtime cost near zero. |
| **Optional "Ask Coach" chat (v2, not MVP)** | Rate-limited live LLM call, gated to paid tiers only | The one place a live LLM call per interaction is justified — a follow-up question the static content didn't anticipate. Cap usage per pass tier to control cost. |

**Cost discipline rule:** never call an LLM live to generate a hint or explanation a user sees during normal practice — those should already exist in the database, written once, reused by everyone. Live AI calls are reserved for the optional chat add-on only.

---

## 8. Database Schema

Builds on the original abstract hierarchy, extended for the pedagogical layers:

```
Exams
  id, exam_name, passing_score_pct, description

Categories
  id, exam_id, category_name, big_picture_primer_text

Subtopics
  id, category_id, subtopic_name, tags (for cross-exam reuse, e.g. "constitution")

Questions
  id, subtopic_id, question_text, options (JSON array),
  correct_option, difficulty_level,
  hint_ladder (JSON: array of rung texts),
  choice_explanations (JSON: one explanation per option, not just correct one),
  next_time_rule (text)

Users
  id, name, email, exam_target, level_target (Professional/Sub-Professional)

UserAttempts
  id, user_id, question_id, chosen_option, is_correct,
  confidence_rating (1-5), hints_used_count, time_spent_seconds, attempted_at

JournalEntries
  id, user_id, question_id, note_text, created_at

ReviewState  (Leitner-box spaced repetition)
  id, user_id, question_id, box_level (1-5), next_review_date, last_result

Passes
  id, user_id, tier, started_at, expires_at
```

**Why this shape scales:** adding LET, NAPOLCOM, or a nursing board exam later is a matter of inserting new rows into `Exams`, `Categories`, and `Subtopics` — the app logic, UI, hint-ladder system, journal, and spaced-review engine all work unchanged. The `tags` field on `Subtopics` lets you **reuse** content across exams (e.g., "Philippine Constitution" content can serve CSE, LET, and other board exams without duplicating it), which is real scalability, not just theoretical.

---

## 9. Monetization

Keep the "urgency-driven sprint pass" instinct from the original draft — it correctly matches how Filipinos actually study (intense cramming in the final weeks, not steady year-round subscriptions), and it prices comfortably below review centers while sitting near existing app pricing:

| Tier | Price | Includes |
|---|---|---|
| **Free** | ₱0 | Full access to Practice Mode with guided hints + big-picture primers, for a limited question pool. This is your trust-builder and word-of-mouth engine — let people *feel* the coaching quality before paying. |
| **15-Day Critical Pass** | ₱199 | Full question bank, timed mock exams, spaced review queue, unlimited journal |
| **30-Day Mastery Pass** | ₱299 (recommended default) | Everything above + interleaved drills, weakest-subtopic auto-targeting, "Ask Coach" chat (rate-limited) |

Because the Professional-level pass rate is only 10–12%, credibility matters more than feature count here — real testimonials and transparent "here's what actually changed" framing will do more for conversion than aggressive upsells.

---

## 10. Rollout Roadmap (revised for a realistic timeline)

| Phase | Window | Focus |
|---|---|---|
| **Phase 0 — Research** | Now → Aug 9, 2026 | No code. Wife keeps an error/confusion log while studying for the real exam. This is free, high-quality primary research. |
| **Phase 1 — Content Blueprinting** | Aug – Oct 2026 | Author the first ~500–1,000 questions with full 5-layer content (AI-assisted drafts, human-reviewed). Do not start building software until this baseline exists. |
| **Phase 2 — Serverless MVP** | Oct – Dec 2026 | Build the interface: hint ladder, deconstruction card, journal, review queue, mock exam mode. Hook up to Supabase. |
| **Phase 3 — Beta Test** | Jan – Feb 2027 | Small cohort (wife + a handful of her fellow reviewees, or your own students) uses it ahead of the **March 2027 CSE-PPT** — a real exam with real runway this time. |
| **Phase 4 — Iterate & Expand** | Post-March 2027 | Use results + feedback to refine, then use the abstract schema to add LET or another board exam without touching the core engine. |

---

## 11. Open Questions to Resolve During Build (for Gemini Antigravity / whoever builds this)

- Exact UI for the hint ladder — inline expansion under the question, or a modal/side panel?
- How much of the initial 500–1,000 question set should be AI-drafted vs. sourced from past CSE patterns and CSC memorandum circulars (for General Information)?
- QA workflow if more than one person (e.g. fellow ZPPSU faculty) ends up contributing content — who reviews for accuracy before publishing?
- Whether the "Ask Coach" live chat feature is worth the added cost/complexity for v1, or should wait for v2 once there's real usage data on how often static content falls short.

---

## 12. Worked Example — All Layers Together

**Question:** "A government office distributed ₱45,000 among three employees in the ratio 2:3:4. How much did the employee with the largest share receive?"

- **Big-picture primer (shown once, before the section starts):** the Numerical Ability framing from 5.1.
- **User attempts, gets it wrong, taps "Guide me":**
  - Rung 1: "This is a Ratio and Proportion problem disguised as an office salary split."
  - Rung 2: Shows "₱45,000 ÷ (2+3+4) parts" with the filler ("government office," "employees") grayed out.
  - Rung 3: "Option B assumes you divided by 3, not by the total number of parts (9) — that's the trap."
  - Rung 4: "Once you know each 'part' is worth ₱5,000, what does the largest share (4 parts) come out to?"
- **User answers correctly. Deconstruction Card shows:**
  - Blueprint ID, Deconstruct (same as above, permanently attached to the question)
  - Choice-by-choice: explanation for A, B, C, and D individually
  - Next-Time Rule: "Whenever you see a ratio, count total parts first — most wrong answers come from dividing by the wrong number."
- **User adds a personal note:** "I always forget to add up the ratio parts first — check total parts BEFORE dividing."
- **Confidence check:** user rates themselves 3/5 → item goes into box 2 of the review queue, resurfaces in ~3 days instead of immediately dropping out of rotation.

---

## Sources Consulted

- CSC 2026 Examination Calendar — https://www.csc.gov.ph/2026-civil-service-exam-schedule-and-application-timelines-released
- CSC Examination Announcement No. 03, s. 2026 — https://csc.gov.ph/examination-advisories/examination-announcement-no-03-s-2026-conduct-of-career-service-examination-pen-and-paper-test-cse-ppt-for-professional-and-subprofessional-levels-09-august-2026
- CSE-PPT structure, pass rate, examinee volume — https://topnotcher.ph/csc-civil-service-exam-reviewer/
- Existing PH reviewer app feature sets — Google Play / App Store listings for "Civil Service Reviewer 2026," "Civil Service Exam Reviewer PH"
- Retrieval/spaced practice meta-analysis (Hattie & Donoghue 2021; Dunlosky et al. 2013) — https://evidencebased.education/resource/retrieval-and-spaced-practice-study-strategies-that-must-be-combined/
- Evidence-based learning strategy ranking (retrieval, spacing, interleaving, elaboration) — https://jennykraft.de/deep-research/learning-methods/
- UWorld's "explain every option, not just the correct one" philosophy — https://thematchguy.com/uworld-for-usmle-step-1-and-step-2-ck/ and https://accounting.uworld.com/our-difference/active-learning/
- Socratic/scaffolded AI tutoring research — https://www.evelynlearning.com/blog/the-socratic-method-meets-machine-learning-how-ai-tutoring-tools-are-teaching-students-to-think-not-just-answer and https://arxiv.org/pdf/2602.19303
