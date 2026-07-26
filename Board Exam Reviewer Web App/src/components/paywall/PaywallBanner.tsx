import React, { useState } from 'react';
import { Card } from '../Card';
import { Button } from '../Button';
import { CheckoutModal } from './CheckoutModal';
import posthog from 'posthog-js';
import './PaywallBanner.css';

interface PaywallBannerProps {
  onSuccess?: () => void;
}

export const PaywallBanner: React.FC<PaywallBannerProps> = ({ onSuccess }) => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleOpenCheckout = () => {
    posthog.capture('upgrade_clicked');
    setIsCheckoutOpen(true);
  };

  return (
    <>
      <Card className="paywall-banner-card" variant="interactive" onClick={handleOpenCheckout}>
        <div className="paywall-banner-content">
          <div className="paywall-icon">⭐</div>
          <div className="paywall-text">
            <h3>Unlock Pro Access</h3>
            <p>Get ⚡ 100% Ad-Free studying, unlimited 170-item simulations, and full 2,910+ question bank access.</p>
          </div>
          <Button variant="primary" onClick={(e) => { e.stopPropagation(); handleOpenCheckout(); }}>
            Upgrade Now
          </Button>
        </div>
      </Card>

      {isCheckoutOpen && (
        <CheckoutModal
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={() => {
            setIsCheckoutOpen(false);
            if (onSuccess) onSuccess();
          }}
        />
      )}
    </>
  );
};
