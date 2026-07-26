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

    const { userId, plan } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (plan !== '15_days' && plan !== '30_days') {
      return new Response(JSON.stringify({ error: 'Invalid plan selected' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const authHeader = `Basic ${btoa(PAYMONGO_SECRET_KEY + ':')}`;
    const amount = plan === '15_days' ? 7400 : 14900;
    const name = plan === '15_days' ? '15-Day Cram Pass' : '30-Day Mastery Pass';
    const description = `Gabay CSE Reviewer - ${name}`;
    const txId = crypto.randomUUID();

    const origin = req.headers.get('origin') || 'http://localhost:5173';

    const payload = {
      data: {
        attributes: {
          line_items: [
            {
              currency: 'PHP',
              amount: amount,
              description: description,
              name: name,
              quantity: 1,
            },
          ],
          payment_method_types: ['gcash', 'maya', 'card', 'qrph', 'paymaya'],
          success_url: `${origin}/checkout/success?tx_id=${txId}`,
          cancel_url: `${origin}/checkout/cancel?tx_id=${txId}`,
          description: 'Unlock full access to the Gabay CSE Reviewer.',
          metadata: {
            user_id: userId,
            plan: plan,
            tx_id: txId,
          },
        },
      },
    };

    const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('PayMongo error:', errorData);
      const detail = errorData?.errors?.[0]?.detail || errorData?.errors?.[0]?.code || '';
      if (detail.toLowerCase().includes('account') || detail.toLowerCase().includes('unverified') || detail.toLowerCase().includes('disabled')) {
        throw new Error('PayMongo account activation is currently under verification. Online GCash/Maya checkout will open as soon as verification completes!');
      }
      throw new Error(detail || 'Failed to create PayMongo checkout session.');
    }

    const paymongoData = await response.json();
    const sessionId = paymongoData.data.id;

    // Record pending pass in Supabase if URL and SERVICE_ROLE key exist
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (supabaseUrl && serviceKey) {
      const supabaseAdmin = createClient(supabaseUrl, serviceKey);
      await supabaseAdmin.from('passes').upsert({
        user_id: userId,
        paymongo_checkout_session_id: sessionId,
        amount_cents: amount,
        status: 'pending',
        fulfilled: false,
      }, { onConflict: 'paymongo_checkout_session_id' });
    }

    return new Response(JSON.stringify({
      checkout_url: paymongoData.data.attributes.checkout_url,
      session_id: sessionId,
      tx_id: txId,
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('Checkout creation error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
