import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const PAYMONGO_SECRET_KEY = Deno.env.get('PAYMONGO_SECRET_KEY') ?? '';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { sessionId, txId } = await req.json();

    const authHeader = req.headers.get('Authorization');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    let supabaseAdmin: any = null;
    if (supabaseUrl && serviceKey) {
      supabaseAdmin = createClient(supabaseUrl, serviceKey);
    }

    let user: any = null;
    if (authHeader && supabaseUrl) {
      const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
      const supabaseUserClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
      const { data } = await supabaseUserClient.auth.getUser();
      user = data.user;
    }

    let targetSessionId = sessionId;

    // If targetSessionId is missing, attempt lookup in passes table via userId
    if (!targetSessionId && user && supabaseAdmin) {
      const { data: latestPass } = await supabaseAdmin
        .from('passes')
        .select('paymongo_checkout_session_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestPass?.paymongo_checkout_session_id) {
        targetSessionId = latestPass.paymongo_checkout_session_id;
      }
    }

    if (!targetSessionId) {
      return new Response(JSON.stringify({
        verified: false,
        isPaid: false,
        reason: 'No session_id provided or found for verification.',
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Query PayMongo API for session status
    const paymongoAuthHeader = `Basic ${btoa(PAYMONGO_SECRET_KEY + ':')}`;
    const pmResponse = await fetch(`https://api.paymongo.com/v1/checkout_sessions/${targetSessionId}`, {
      method: 'GET',
      headers: {
        'Authorization': paymongoAuthHeader,
      },
    });

    if (!pmResponse.ok) {
      const errorText = await pmResponse.text();
      console.error('PayMongo fetch error:', errorText);
      return new Response(JSON.stringify({
        verified: false,
        isPaid: false,
        reason: 'Failed to query PayMongo checkout session API.',
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const pmData = await pmResponse.json();
    const sessionAttr = pmData.data?.attributes || {};
    const payments = sessionAttr.payments || [];
    const paymentIntent = sessionAttr.payment_intent?.attributes || {};

    const hasPaidPayment = payments.some((p: any) => p.attributes?.status === 'paid');
    const isIntentSucceeded = paymentIntent.status === 'succeeded';

    const isPaid = hasPaidPayment || isIntentSucceeded;
    const plan = sessionAttr.metadata?.plan || '30_days';
    const sessionUserId = sessionAttr.metadata?.user_id || user?.id;

    if (isPaid) {
      const daysToAdd = plan === '15_days' ? 15 : 30;
      const expiresAt = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000).toISOString();

      if (supabaseAdmin && sessionUserId) {
        // Fulfill pass
        await supabaseAdmin.from('passes').upsert({
          user_id: sessionUserId,
          paymongo_checkout_session_id: targetSessionId,
          amount_cents: sessionAttr.line_items?.[0]?.amount || (plan === '15_days' ? 7400 : 14900),
          status: 'paid',
          fulfilled: true,
        }, { onConflict: 'paymongo_checkout_session_id' });

        // Grant entitlement
        await supabaseAdmin.from('user_entitlements').upsert({
          user_id: sessionUserId,
          plan_type: 'pro',
          is_premium: true,
          expires_at: expiresAt,
        }, { onConflict: 'user_id' });
      }

      return new Response(JSON.stringify({
        verified: true,
        isPaid: true,
        plan: plan,
        expiresAt: expiresAt,
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } else {
      // Mark pass as unpaid / failed if present
      if (supabaseAdmin && sessionUserId) {
        await supabaseAdmin.from('passes').upsert({
          user_id: sessionUserId,
          paymongo_checkout_session_id: targetSessionId,
          amount_cents: sessionAttr.line_items?.[0]?.amount || (plan === '15_days' ? 7400 : 14900),
          status: sessionAttr.status || 'unpaid',
          fulfilled: false,
        }, { onConflict: 'paymongo_checkout_session_id' });
      }

      return new Response(JSON.stringify({
        verified: true,
        isPaid: false,
        status: sessionAttr.status || 'unpaid',
        reason: 'Payment was not completed in GCash/PayMongo.',
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

  } catch (error: any) {
    console.error('Verify checkout error:', error);
    return new Response(JSON.stringify({
      verified: false,
      isPaid: false,
      error: error.message || 'Internal server error',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
