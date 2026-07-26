import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useEntitlement } from '../hooks/useEntitlement';
import './AdUnit.css';

interface AdUnitProps {
  slotId: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  layoutKey?: string;
  className?: string;
  minHeight?: string;
  label?: string;
  enabled?: boolean;
}

declare global {
  interface Window {
    adsbygoogle?: any[];
    googletag?: {
      destroySlots?: () => void;
      pubads?: () => {
        refresh?: () => void;
      };
    };
  }
}

export const AdUnit: React.FC<AdUnitProps> = ({
  slotId,
  format = 'auto',
  layoutKey,
  className = '',
  minHeight = '60px',
  label = 'SPONSORED ADVERTISEMENT',
  enabled = true,
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const pushedRef = useRef<boolean>(false);
  const location = useLocation();
  const { isPremium } = useEntitlement();

  // Disable all ads completely for Pro subscribers
  const isAdActive = enabled && !isPremium;

  // SPA Route Lifecycle Manager: Clean up slots on route change
  useEffect(() => {
    return () => {
      try {
        if (window.googletag && typeof window.googletag.destroySlots === 'function') {
          window.googletag.destroySlots();
        }
      } catch (e) {
        console.warn('AdSense slot destruction error:', e);
      }
    };
  }, [location.pathname]);

  // Safe ad initialization guard
  useEffect(() => {
    if (!isAdActive || pushedRef.current) return;
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
      }
    } catch (e) {
      console.warn('AdSense load warning:', e);
    }
  }, [slotId, isAdActive, location.pathname]);

  // Fallback scaffold guard & Pro user ad-free guard: Never render ads if disabled or user is Pro subscriber
  if (!isAdActive) return null;

  return (
    <div
      ref={adRef}
      className={`gabay-ad-wrapper ${className}`}
      style={{ minHeight }}
    >
      <span className="gabay-ad-label">{label}</span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight }}
        data-ad-client="ca-pub-8857143454837732"
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
        {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
      />
    </div>
  );
};
