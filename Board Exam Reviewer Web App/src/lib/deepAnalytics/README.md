# Deep Analytics & Unified Answer Architecture

## Overview
This directory houses the core analytics and item psychometrics calculation engines for the Gabay Civil Service Reviewer.

## Data Pipeline & Unified Answer Contract
All user responses—whether originated from **Full Mock Exams** (`mock_exam_answers` table) or **Spaced Repetition / Practice Sessions** (`attempts` table)—are normalized into a single unified data pipeline via `useUnifiedAnswers()`.

```
[mock_exam_answers] ───> mapMockExamAnswers() ───┐
                                                 ├───> UnifiedAnswer[] ───> buildStatisticsModel() / useContentHealth()
[attempts] ───────────> mapPracticeAttempts() ───┘
```

### Answer Normalization Rule
Both `selectedAnswer` and `correctAnswer` are passed through `normalizeAnswer(s)` (trimming whitespace and converting to uppercase) before comparison to guarantee accuracy across varying data sources.

### Orphaned Record Strategy (Skip-and-Count)
If an attempt references a `question_id` missing from the local IndexedDB `questions` table, it is skipped (`orphanedCount++`) rather than injected with fake default tags (like `'General'`). This guarantees that metrics on the **Statistics Page** and **Admin Dashboard** reflect true data quality without silent statistical corruption.

## Directory Structure
- `config.ts`: Configurable psychometric thresholds (`CONTENT_HEALTH_CONFIG`).
- `types.ts`: TypeScript contracts (`UnifiedAnswer`, `MapResult`, `StatisticsModel`, `ScatterPoint`, `StaminaPoint`).
- `mappers.ts`: Pure normalization and mapping functions (`mapMockExamAnswers`, `mapPracticeAttempts`).
- `hooks/useUnifiedAnswers.ts`: Shared compound Dexie hydration hook serving as single source of truth.
- `index.ts`: Master model builder delegating to individual chart calculators:
  - `radar.ts`: 5-Axis Subject Area Radar.
  - `mastery.ts`: Subtopic Heatmap Bins (`insufficient_data` | `low` | `mid` | `high`).
  - `scatter.ts`: Speed vs. Accuracy Scatter diagnostics.
  - `stamina.ts`: Quartile Fatigue Analysis & INV-023 warning flags.
