# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Added AI script (`scripts/generate-ai-content.ts`) to procedurally generate the remaining 3,463 exam questions.
- Integrated `npm run test:lighthouse` and `npm run test:a11y` commands to support Phase 2 Ship Gate verifications.
- Defined Lighthouse budgets (`scripts/lighthouseBudget.json`) for performance and resource size tracking.
- Enabled TypeScript strict mode (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) in `tsconfig.app.json`.

### Fixed
- Resolved all TypeScript strict compilation errors across `mockExamPersistence`, `questionSelection`, `readinessIndex`, `retakeManager`, and React UI components.
- Fixed React Hook dependency warnings caught by Oxlint.
- Disabled `useStudySession` and `useMockExamSession` exhaustive-deps warnings where intentional.

### Changed
- Standardized `LocalQuestion` and `RetakeOverlapResult` types to fully comply with `exactOptionalPropertyTypes`.
- Reorganized README to correctly portray the Gabay CSE Reviewer functionality instead of Vite boilerplate.

## [Phase 2 - Development] - 2026-07-20

### Added
- Implemented Phase 2 mock exam simulation engines.
- Created `MockExamSession.tsx` and associated hooks/persistence layers.
- Added Leitner Injection engine to automatically import incorrect mock exam items to spaced repetition queue.

### Changed
- Upgraded `db.ts` to v6 Schema to support Mock Exams, Anxiety Toolkit, and Entitlements.
