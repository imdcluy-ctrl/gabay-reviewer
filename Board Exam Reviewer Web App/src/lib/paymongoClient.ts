import { supabase } from './supabaseClient';

export interface CheckoutSessionResponse {
  checkoutUrl: string;
  sessionId: string;
  txId?: string;
}

export interface VerificationResult {
  verified: boolean;
  isPaid: boolean;
  status?: string;
  plan?: string;
  expiresAt?: string;
  reason?: string;
  error?: string;
}

export async function createCheckoutSession(userId: string, plan: '15_days' | '30_days'): Promise<CheckoutSessionResponse> {
  const { data, error } = await supabase.functions.invoke('create-checkout', {
    body: { userId, plan },
  });

  if (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Failed to initialize checkout. Please try again later.');
  }

  return {
    checkoutUrl: data.checkout_url,
    sessionId: data.session_id,
    txId: data.tx_id,
  };
}

export async function verifyCheckoutSession(sessionId?: string, txId?: string): Promise<VerificationResult> {
  try {
    const { data, error } = await supabase.functions.invoke('verify-checkout', {
      body: { sessionId, txId },
    });

    if (error) {
      console.error('Error calling verify-checkout edge function:', error);
      return {
        verified: false,
        isPaid: false,
        error: error.message || 'Verification function error',
      };
    }

    return data as VerificationResult;
  } catch (err: any) {
    console.error('Verification error:', err);
    return {
      verified: false,
      isPaid: false,
      error: err.message || 'Failed to communicate with payment server',
    };
  }
}
