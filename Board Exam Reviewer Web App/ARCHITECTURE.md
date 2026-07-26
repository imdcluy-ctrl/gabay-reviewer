# Gabay Architecture

## Overview
Gabay is an offline-first Single Page Application (SPA) designed to function without an internet connection after initial load. It uses modern browser storage (IndexedDB) for primary data persistence and will sync to Supabase (PostgreSQL) when a connection is available (Phase 3).

## Core Technologies
- **Vite & React 19**: Frontend framework and build tooling.
- **Dexie.js**: IndexedDB wrapper for local state persistence.
- **Supabase**: Backend-as-a-Service for cloud sync and authentication.
- **PayMongo**: Payment gateway for Premium plan access.

## Application Layers

### 1. Presentation Layer (React)
- **Pages**: Top-level route components (`MockExamSession.tsx`, `Dashboard.tsx`, etc.)
- **Components**: Reusable UI elements (`Button`, `Card`, `ProgressRing`).
- **Hooks**: Custom hooks binding Dexie queries to React state (`useMockExamSession.ts`, `useUserProfile.ts`).

### 2. Business Logic Layer
- **Leitner System**: Manages spaced repetition box promotion/demotion (`src/lib/leitner.ts`).
- **Readiness Index**: Calculates the user's exam readiness score (`src/lib/readinessIndex.ts`).
- **Mock Exam Engine**: Handles test generation, time tracking, and grading (`src/lib/mockExamSelection.ts`).
- **Entitlements**: Manages free vs. premium access and limits (`src/lib/entitlements.ts`).

### 3. Data Persistence Layer (IndexedDB / Dexie)
- Defined in `src/lib/db.ts`.
- **v6 Schema Migrations**: Supports mock exams, error tags, worry dumps, and offline user entitlements.
- **Multi-Device Race Resolution**: The sync protocol uses a Last-Write-Wins (LWW) strategy with timestamps.

## Component Flow: Mock Exam
1. User starts exam via `MockExamSession.tsx`.
2. `useMockExamSession` hook initializes the attempt in `db.mock_exam_attempts`.
3. Question selection draws from `db.questions` filtering out previously seen questions where possible.
4. User inputs are saved in real-time to `db.mock_exam_answers`.
5. Upon submission, the engine grades the exam and updates `db.review_state` (Leitner Injection) based on incorrectly answered questions.
