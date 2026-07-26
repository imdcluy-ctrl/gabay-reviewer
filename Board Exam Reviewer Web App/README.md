# Gabay - Philippine Civil Service Exam Reviewer

Gabay is an offline-first, Progressive Web App (PWA) designed to help Filipinos prepare for the Civil Service Examination (CSE-PPT) Professional Level. It uses spaced repetition (Leitner system), cognitive load management, and realistic mock exams to optimize study time.

## Features
- **Offline-First**: Fully functional without an internet connection, storing data locally via Dexie.js (IndexedDB).
- **Spaced Repetition**: Leitner box system with 5 levels, including automatic leech detection.
- **Mock Exams**: Full-length 170-item simulations mirroring the actual CSE-PPT.
- **Readiness Index**: A proprietary algorithm calculating exam readiness based on consistency, mastery, and mock exam scores.
- **Anxiety Toolkit**: Evidence-based tools like Box Breathing and Worry Dumps to manage pre-exam anxiety.

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite
- **Database**: Dexie.js (IndexedDB) for local persistence
- **Backend/Auth (Phase 3)**: Supabase & PayMongo
- **PWA**: vite-plugin-pwa

## Getting Started

1. Clone the repository.
2. Run `npm install`.
3. Run `npm run dev` to start the local development server.
4. Run `npm run content:seed` to compile the YAML question bank into `seed.json`.

## Scripts
- `npm run dev`: Start dev server
- `npm run build`: Build for production
- `npm run test:unit`: Run test suites
- `npm run lint`: Run Oxlint
- `npm run content:generate`: Run AI script to procedurally generate questions using Gemini API.
