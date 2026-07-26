import React, { useState, useEffect } from 'react';
import posthog from 'posthog-js';

import { createCheckoutSession } from '../../lib/paymongoClient';
import { useUserProfile } from '../../hooks/useUserProfile';
import { trapFocus } from '../../lib/focusTrap';
import './CheckoutModal.css';

interface CheckoutModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

type PlanType = '15_days' | '30_days';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onClose }) => {
  const { profile } = useUserProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('30_days');
  const modalRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modalRef.current) {
      return trapFocus(modalRef.current);
    }
  }, []);

  const handleCheckout = async () => {
    if (!profile?.id) {
      setError("Please ensure you are logged in or have a valid guest ID before purchasing.");
      return;
    }
    
    posthog.capture('checkout_started', { plan: selectedPlan });
    setIsLoading(true);
    setError(null);

    try {
      const response = await createCheckoutSession(profile.id, selectedPlan);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('gabay_pending_checkout_session', JSON.stringify({
          sessionId: response.sessionId,
          txId: response.txId,
          timestamp: Date.now(),
        }));
      }
      window.location.href = response.checkoutUrl;
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to connect to PayMongo checkout. Please verify your internet or try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="checkout-overlay" role="dialog" aria-modal="true" ref={modalRef}>
      <div className="checkout-modal">
        {/* Header */}
        <div className="checkout-header">
          <div className="checkout-header-badge">⚡ Instant Activation</div>
          <h2>Unlock Gabay Pro Pass</h2>
          <p className="checkout-header-sub">Master the Philippine Civil Service Exam with 2,910+ carefully crafted Socratic questions.</p>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">✕</button>
        </div>
        
        <div className="checkout-body">
          <div className="checkout-body-grid">
            {/* Left Column: Plans & Action */}
            <div className="checkout-col-left">
              <div className="promo-banner">
                <span className="promo-sparkle">🔥</span> 
                <span><strong>Early Bird Special</strong> — Lock in these rates before the official CSE exam date!</span>
              </div>

              <div className="plan-selector">
                <label className={`plan-card ${selectedPlan === '30_days' ? 'selected' : ''}`}>
                  <div className="plan-card-header">
                    <input 
                      type="radio" 
                      name="plan" 
                      value="30_days" 
                      checked={selectedPlan === '30_days'} 
                      onChange={() => setSelectedPlan('30_days')} 
                    />
                    <div className="plan-details">
                      <div className="plan-title-wrapper">
                        <span className="plan-title">30-Day Mastery Pass</span>
                        <span className="badge-best-value">BEST VALUE</span>
                      </div>
                      <span className="plan-sub">Your full month-long reviewer • 2,910+ question bank</span>
                    </div>
                    <div className="plan-price-group">
                      <span className="plan-price">₱149</span>
                      <span className="plan-original-price">₱299</span>
                    </div>
                  </div>
                </label>

                <label className={`plan-card ${selectedPlan === '15_days' ? 'selected' : ''}`}>
                  <div className="plan-card-header">
                    <input 
                      type="radio" 
                      name="plan" 
                      value="15_days" 
                      checked={selectedPlan === '15_days'} 
                      onChange={() => setSelectedPlan('15_days')} 
                    />
                    <div className="plan-details">
                      <span className="plan-title">15-Day Cram Pass</span>
                      <span className="plan-sub">For when exam day is close and you need to move fast</span>
                    </div>
                    <div className="plan-price-group">
                      <span className="plan-price">₱74</span>
                      <span className="plan-original-price">₱149</span>
                    </div>
                  </div>
                </label>
              </div>

              {error && (
                <div className="checkout-error">
                  <span className="error-icon">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="checkout-actions">
                <button className="btn-cancel" onClick={onClose} disabled={isLoading}>
                  Cancel
                </button>
                <button className="btn-paymongo" onClick={handleCheckout} disabled={isLoading}>
                  {isLoading ? (
                    <span className="loading-spinner-wrapper">
                      <span className="spinner"></span> Redirecting...
                    </span>
                  ) : (
                    <>
                      <span>Proceed to Pay via PayMongo</span>
                      <span className="arrow">→</span>
                    </>
                  )}
                </button>
              </div>

              <div className="payment-footer">
                <div className="payment-badges">
                  <span className="payment-badge gcash">GCash</span>
                  <span className="payment-badge maya">Maya</span>
                  <span className="payment-badge qrph">QR Ph</span>
                  <span className="payment-badge card">Visa / Mastercard</span>
                </div>
                <p className="checkout-secure-note">
                  🔒 256-bit encrypted checkout, powered by PayMongo Philippines.
                </p>
                <p className="modal-disclaimer-note" style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '8px', lineHeight: 1.35, textAlign: 'center' }}>
                  Gabay Pro is an independent exam-prep tool and is not affiliated with, endorsed by, or sponsored by the Civil Service Commission (CSC). All questions are originally written and not sourced from actual CSC examination materials.
                </p>
              </div>
            </div>

            {/* Right Column: Included Features */}
            <div className="checkout-col-right">
              <div className="benefits-container">
                <h4 className="benefits-title">Here's everything you unlock the moment you upgrade:</h4>
                <ul className="benefits-list">
                  <li>
                    <span className="check-icon">✓</span>
                    <span><strong>⚡ 100% Ad-Free Study Experience</strong> — All sponsored ads completely disabled for 100% distraction-free studying.</span>
                  </li>
                  <li>
                    <span className="check-icon">✓</span>
                    <span><strong>Full 2,910+ Question Bank</strong> — All 5 subject categories and 23 subtopics, unlocked (vs. 244 on the free plan).</span>
                  </li>
                  <li>
                    <span className="check-icon">✓</span>
                    <span><strong>Unlimited 170-Item Simulation Exams</strong> — Take as many full timed mock exams as you want, with smart de-duplication so retakes don't just repeat the same items.</span>
                  </li>
                  <li>
                    <span className="check-icon">✓</span>
                    <span><strong>Unlimited Daily Practice</strong> — No caps, no cooldowns. Practice as much as your day allows.</span>
                  </li>
                  <li>
                    <span className="check-icon">✓</span>
                    <span><strong>4-Rung Socratic Hint Ladders</strong> — Progressive hints plus explanations of why the trap answers are traps.</span>
                  </li>
                  <li>
                    <span className="check-icon">✓</span>
                    <span><strong>5-Box Leitner Spaced Repetition</strong> — Your review queue builds itself, and stubborn "leech" cards get flagged for extra attention.</span>
                  </li>
                  <li>
                    <span className="check-icon">✓</span>
                    <span><strong>Readiness Score & Progress Analytics</strong> — Track your practice performance against the 80%+ CSE passing benchmark.</span>
                  </li>
                  <li>
                    <span className="check-icon">✓</span>
                    <span><strong>One-Time Payment</strong> — No subscriptions, no auto-debits, no surprises.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
