import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const ADMIN_EMAILS = ['dpduaneluy@gmail.com'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing auth header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      return new Response(JSON.stringify({ isPremium: true, planType: 'pro', isAdmin: true }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const { data: entitlement, error: entError } = await supabase
      .from('user_entitlements')
      .select('plan_type, is_premium')
      .eq('user_id', user.id)
      .single();

    if (entError && entError.code !== 'PGRST116') {
      throw entError;
    }

    const isPremium = entitlement?.is_premium || false;
    const planType = entitlement?.plan_type || 'free';

    return new Response(JSON.stringify({ isPremium, planType }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    console.error('get-pass-status error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
