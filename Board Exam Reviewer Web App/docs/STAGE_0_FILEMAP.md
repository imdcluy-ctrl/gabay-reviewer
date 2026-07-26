# Stage 0 Filemap (Consolidated Architecture)

This document maps the core structural files of the Gabay app following the Phase 3 PayMongo + Supabase migration.

## Root Directory
- `package.json`: Dependencies and scripts (Vite, TypeScript, Dexie, Supabase).
- `run_dev.bat`: Helper script for auto-loading localhost dev server.
- `tsconfig.app.json`: Strict TypeScript compiler options.
- `vite.config.ts`: Vite setup with PWA plugin configured for offline-first capabilities.

## Source Code (`src/`)
- `App.tsx`: Routing engine (React Router) with protected endpoints (`/dashboard`, `/checkout/*`).
- `main.tsx`: Entry point.
- **`lib/`**:
  - `db.ts`: Dexie local first IndexedDB schema (v6).
  - `entitlements.ts`: Edge function/client communication layer for PayMongo quotas.
  - `supabaseClient.ts`: Public Anon key initialization.
  - `paymongoClient.ts`: Helper for `/create-checkout` function invocation.
- **`components/paywall/`**:
  - `CheckoutModal.tsx`, `PaywallBanner.tsx`: UI for upgrade gates.
- **`pages/`**:
  - `CheckoutReturn.tsx`: Success/Cancel routing handlers.
  - `MockExamSession.tsx`: Timed, rigorous exam interface.
  - `Dashboard.tsx`: Central hub.

## Backend Code
- `supabase/migrations/`: SQL definitions for `passes` and `user_entitlements` with RLS.
- `supabase/functions/`:
  - `create-checkout`: Deno edge function to securely generate PayMongo checkout URLs.
  - `paymongo-webhook`: Deno edge function listening for PayMongo success events.

## Test Scripts (`tests/` & `scripts/`)
- `tests/e2e/`: Playwright end-to-end tests for critical flows.
- `tests/*.test.ts`: Comprehensive suite of business logic validations.
- `scripts/assertNoSecretsInBundle.ts`: Build-time Ship Gate security assertion.
- `scripts/generate-ai-content.ts`: Gemini procedural content generation tool.
