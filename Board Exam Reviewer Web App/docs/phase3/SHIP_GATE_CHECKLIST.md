# Phase 3 Ship Gate Checklist (PayMongo + Supabase)

## Definition of Done: Phase 3
- [x] Integrate Supabase DB for `passes` and `user_entitlements`.
- [x] Integrate PayMongo checkout flow (GCash, Maya, Card).
- [x] Secure `paymongo-webhook` Edge Function.
- [x] Create fallback local cache for offline entitlements.
- [x] Run AI Content script to complete 3,500 question pool.

## Security Gates
- [x] Run `assertNoSecretsInBundle.ts` to ensure `VITE_SUPABASE_ANON_KEY` and public keys are the only ones shipped to the client. No service role or private keys.

## Testing Gates
- [x] Passing Lighthouse PWA & A11y tests.
- [x] Passing E2E checkout Playwright stubs.
- [x] Passing unit tests for Entitlements, Selection logic.

## Approval
- Approved by: 
- Date: 
