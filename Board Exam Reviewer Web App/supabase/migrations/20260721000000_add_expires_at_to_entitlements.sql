-- Phase 5: Add expires_at to user_entitlements for time-gated promo pricing

ALTER TABLE public.user_entitlements
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
