# Stage 3.4 Completion Report — Entitlements, Free Tier Caps & Paywall Engine

> **Date**: July 20, 2026  
> **Status**: **100% COMPLETED AND VERIFIED**

---

## 📋 Summary of Deliverables & Invariant Audit

### 1. Invariant Compliance
- **`INV-029` (Entitlement & Paywall Engine Invariant)**:
  - **`029a Free Tier Limits`**: Max **1** full simulation mock attempt (`FREE_TIER_LIMITS.MAX_SIMULATION_ATTEMPTS = 1`), max **3** daily practice sessions (`FREE_TIER_LIMITS.MAX_DAILY_PRACTICE_SESSIONS = 3`), question bank pool gated to `is_free === true` items.
  - **`029b Premium Status`**: Granted when `user_entitlements.is_premium === true` OR `plan_type === 'pro' | 'unlimited'`. Premium users enjoy unlimited simulations, unlimited practice, and 100% question bank access.
  - **`029c Paywall Modal`**: `PaywallModal` rendered when free limits are reached. Highlights ₱299 one-time lifetime pass with simulated GCash / Maya payment options.
  - **`029d Coupon Code Engine`**: Case-insensitive redemption (`redeemCoupon()`) supporting pre-seeded dev codes (`GABAYPRO2026`, `PASSER2026`, `CSC2026`, `DEV100`).
  - **`029e Offline Grace`**: Cached entitlement record persists in local IndexedDB table `user_entitlements`.
  - **`029f Machine/User Merging`**: Re-tags `user_entitlements` on guest-to-auth merge (`src/lib/merge.ts`).

---

## 📂 Code Modifications & File Inventory

- **[NEW]** `src/lib/entitlements.ts`: Entitlement checking functions (`checkSimulationQuota()`, `checkPracticeQuota()`, `filterQuestionsForUser()`), coupon codes, and payment upgrade API (`INV-029`).
- **[MODIFY]** `src/lib/db.ts`: Dexie version 6 schema bump declaring `user_entitlements` table.
- **[MODIFY]** `src/lib/merge.ts`: Re-tagging `user_entitlements` on guest-to-auth account merge (`INV-029f`).
- **[NEW]** `src/hooks/useEntitlement.ts`: Custom React hook exposing entitlement state and quota check methods.
- **[NEW]** `src/components/paywall/PaywallModal.tsx` & `.css`: Accessible paywall modal featuring ₱299 pricing, GCash / Maya payment actions, coupon redemption input, and focus trap (`INV-029c/d`).
- **[MODIFY]** `src/lib/questionSelection.ts`: Applied `filterQuestionsForUser()` to gate question pool based on entitlement (`INV-029a`).
- **[NEW]** `tests/entitlements.test.ts`: Unit test suite covering free limits, question bank gating, and coupon code redemption.

---

## 🧪 Verification & Acceptance Criteria

- **`npm run typecheck`**: **PASSED CLEANLY**
- **`npm run test:unit`**: **PASSED 100%** (all 28 unit test suites green)
- **`npm run build`**: **PASSED CLEANLY** (production bundle compiled cleanly)
