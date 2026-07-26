import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useUserProfile } from '../hooks/useUserProfile';
import { db } from '../lib/db';
import { verifyCheckoutSession } from '../lib/paymongoClient';
import type { VerificationResult } from '../lib/paymongoClient';
import './CheckoutReturn.css';

export const CheckoutReturn: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useUserProfile();
  
  const isSuccessRoute = location.pathname.includes('/success');

  const [verifying, setVerifying] = useState<boolean>(isSuccessRoute);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkPaymentStatus() {
      if (!isSuccessRoute) {
        setVerifying(false);
        return;
      }

      const searchParams = new URLSearchParams(location.search);
      const urlSessionId = searchParams.get('session_id') || searchParams.get('checkout_session_id');
      const urlTxId = searchParams.get('tx_id');

      let storedSessionId: string | undefined;
      let storedTxId: string | undefined;

      try {
        const storedStr = sessionStorage.getItem('gabay_pending_checkout_session');
        if (storedStr) {
          const parsed = JSON.parse(storedStr);
          storedSessionId = parsed.sessionId;
          storedTxId = parsed.txId;
        }
      } catch (e) {
        console.error('Error reading pending checkout session:', e);
      }

      const sessionId = urlSessionId || storedSessionId;
      const txId = urlTxId || storedTxId;

      const result = await verifyCheckoutSession(sessionId || undefined, txId || undefined);

      if (!isMounted) return;

      setVerificationResult(result);
      setVerifying(false);

      if (result.isPaid && profile?.id) {
        const daysToAdd = result.plan === '15_days' ? 15 : 30;
        const expiresAt = result.expiresAt || new Date(Date.now() + daysToAdd * 86400000).toISOString();

        await db.user_entitlements.put({
          id: profile.id,
          local_user_id: profile.id,
          plan_type: 'pro',
          is_premium: true,
          expires_at: expiresAt,
          updated_at: Date.now(),
        }).catch(console.error);

        sessionStorage.removeItem('gabay_pending_checkout_session');
      }
    }

    checkPaymentStatus();

    return () => {
      isMounted = false;
    };
  }, [isSuccessRoute, location.search, profile?.id]);

  if (verifying) {
    return (
      <div className="checkout-return-layout">
        <Card className="checkout-return-card">
          <div className="verifying-spinner">⏳</div>
          <h2 className="return-title">Verifying Payment...</h2>
          <p className="return-desc">Confirming transaction with PayMongo payment gateway. Please wait a moment.</p>
          <div className="status-subtext">This usually takes just a few seconds...</div>
        </Card>
      </div>
    );
  }

  const isPaid = isSuccessRoute && verificationResult?.isPaid;

  return (
    <div className="checkout-return-layout">
      <Card className="checkout-return-card">
        {isPaid ? (
          <>
            <div className="status-icon success">🎉</div>
            <h2 className="return-title">Payment Successful!</h2>
            <p className="return-desc">Thank you for upgrading to <strong>Gabay Pro Access</strong>. Your account is now fully unlocked.</p>
            <div className="pro-unlocked-badge">✨ PRO ACCESS ACTIVE</div>
            <p className="status-subtext">You now have unlimited mock exams, 405+ Socratic question worked solutions, and Leitner spaced repetition flashcards.</p>
            <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/dashboard')}>
              Go to Dashboard & Start Studying
            </Button>
          </>
        ) : isSuccessRoute ? (
          <>
            <div className="status-icon cancel">⚠️</div>
            <h2 className="return-title">Payment Not Received</h2>
            <p className="return-desc">
              PayMongo did not register a completed payment for this session. Your account has <strong>not</strong> been charged.
            </p>
            <div className="payment-warning-box">
              <p className="status-subtext error-text">
                {verificationResult?.reason || verificationResult?.error || 'GCash/Maya transaction was not completed or had insufficient funds.'}
              </p>
            </div>
            <p className="status-subtext">If you intended to upgrade, please try again or choose another payment method.</p>
            <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </>
        ) : (
          <>
            <div className="status-icon cancel">⚠️</div>
            <h2 className="return-title">Checkout Cancelled</h2>
            <p className="return-desc">Your payment was not completed and you have not been charged.</p>
            <p className="status-subtext">If you experienced an issue with GCash, Maya, or Card payment, please try again or contact support.</p>
            <Button variant="secondary" size="lg" fullWidth onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </>
        )}
      </Card>
    </div>
  );
};
