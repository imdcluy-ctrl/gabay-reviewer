# Phase 3 Offline Smoke Test Protocols

## 1. Local Cache Verification
1. Open the app while online.
2. Login as a Free user. Verify the `PaywallBanner` appears on the dashboard.
3. Complete the mock exam checkout process. Verify redirection to `/checkout/success`.
4. Turn off Wi-Fi/Ethernet (simulate airplane mode).
5. Ensure the app remains accessible via PWA cache.
6. Verify the `PaywallBanner` is gone and you can start a Mock Exam session offline.

## 2. Sync Verification
1. Complete a mock exam offline.
2. View offline results on the dashboard.
3. Turn Wi-Fi back on.
4. Verify Dexie automatically flushes the local exam payload to Supabase and links it to your authenticated profile ID.
