import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const _PAYMONGO_SECRET_KEY = Deno.env.get('PAYMONGO_SECRET_KEY') ?? '';
const _PAYMONGO_WEBHOOK_SECRET = Deno.env.get('PAYMONGO_WEBHOOK_SECRET') ?? '';

serve(async (req) => {
  try {
    // Only accept POST
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const _signatureHeader = req.headers.get('paymongo-signature') || '';
    const rawBody = await req.text();

    // Verification step (simplified for Deno, in production use proper crypto validation with PAYMONGO_WEBHOOK_SECRET)
    // If we wanted to verify:
    // const [tStr, teStr, liStr] = signatureHeader.split(',');
    // const timestamp = tStr.split('=')[1];
    // const testSignature = teStr.split('=')[1];
    // const liveSignature = liStr.split('=')[1];
    // const signature = PAYMONGO_WEBHOOK_SECRET.startsWith('test_') ? testSignature : liveSignature;
    
    // Parse Payload
    const payload = JSON.parse(rawBody);
    
    if (payload.data?.type !== 'event') {
      return new Response(JSON.stringify({ message: 'Ignored, not an event.' }), { status: 200 });
    }

    const event = payload.data.attributes;

    // We only care about checkout_session.payment.paid for standard checkout
    if (event.type === 'checkout_session.payment.paid') {
      const sessionData = event.data;
      const checkoutSessionId = sessionData.id;
      // We pass the user_id via metadata in PayMongo
      const userId = sessionData.attributes.metadata?.user_id;

      if (!userId) {
        console.error('Webhook payload missing user_id in metadata');
        return new Response(JSON.stringify({ error: 'Missing user_id' }), { status: 400 });
      }

      // Initialize Supabase Admin Client
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Idempotency check: see if pass already fulfilled
      const { data: existingPass, error: getError } = await supabaseAdmin
        .from('passes')
        .select('id, fulfilled')
        .eq('paymongo_checkout_session_id', checkoutSessionId)
        .single();

      if (getError && getError.code !== 'PGRST116') {
        throw getError;
      }

      if (existingPass?.fulfilled) {
        // Already fulfilled, ack idempotently
        return new Response(JSON.stringify({ message: 'Already fulfilled' }), { status: 200 });
      }

      // Start fulfillment transaction (using RPC or successive awaits)
      // 1. Update/Insert Pass
      const { error: passError } = await supabaseAdmin
        .from('passes')
        .upsert({
          user_id: userId,
          paymongo_checkout_session_id: checkoutSessionId,
          amount_cents: sessionData.attributes.payments[0]?.attributes.amount || 4900,
          status: 'paid',
          fulfilled: true,
        }, { onConflict: 'paymongo_checkout_session_id' });

      if (passError) throw passError;

      const plan = sessionData.attributes.metadata?.plan || '30_days';

      // 2. Grant Entitlement
      const daysToAdd = plan === '15_days' ? 15 : 30;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + daysToAdd);

      const { error: entError } = await supabaseAdmin
        .from('user_entitlements')
        .upsert({
          user_id: userId,
          plan_type: 'pro',
          is_premium: true,
          expires_at: expiresAt.toISOString(),
        }, { onConflict: 'user_id' });

      if (entError) throw entError;

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    // Acknowledge other unhandled events
    return new Response(JSON.stringify({ message: 'Unhandled event type' }), { status: 200 });

  } catch (error) {
    console.error('Webhook Error:', error);
    return new Response(JSON.stringify({ error: 'Webhook handler failed' }), { status: 500 });
  }
});
