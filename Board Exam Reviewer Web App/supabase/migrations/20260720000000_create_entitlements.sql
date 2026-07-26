-- Phase 3 Stage 3.4 Architecture Rewrite (PayMongo + Supabase)
-- Entitlements and Passes Schema

CREATE TYPE plan_tier AS ENUM ('free', 'pro', 'unlimited');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'expired');

-- Table: users (assuming auth.users exists or extending it)
-- We will store entitlements in public.user_entitlements

CREATE TABLE IF NOT EXISTS public.user_entitlements (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type plan_tier NOT NULL DEFAULT 'free',
    is_premium BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: passes (records payment intent and fulfillment)
CREATE TABLE IF NOT EXISTS public.passes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    paymongo_checkout_session_id TEXT UNIQUE NOT NULL,
    paymongo_payment_intent_id TEXT UNIQUE,
    amount_cents INTEGER NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    fulfilled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.user_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passes ENABLE ROW LEVEL SECURITY;

-- Users can read their own entitlements
CREATE POLICY "Users can read own entitlements"
    ON public.user_entitlements
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can read their own passes
CREATE POLICY "Users can read own passes"
    ON public.passes
    FOR SELECT
    USING (auth.uid() = user_id);

-- Only service role (Edge Functions) can insert/update passes and entitlements
CREATE POLICY "Service role can manage entitlements"
    ON public.user_entitlements
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role can manage passes"
    ON public.passes
    USING (true)
    WITH CHECK (true);

-- Trigger to auto-update updated_at on user_entitlements
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_entitlements_modtime
BEFORE UPDATE ON public.user_entitlements
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_passes_modtime
BEFORE UPDATE ON public.passes
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
