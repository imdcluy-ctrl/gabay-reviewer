import React, { useEffect, useState } from 'react';
import { ERROR_TAG_META, type TagDistributionResult } from '../lib/errorTags';
import { getGlobalDistribution } from '../lib/errorTagRepository';
import './ErrorPatternSummary.css';

interface ErrorPatternSummaryProps {
  localUserId: string;
}

export const ErrorPatternSummary: React.FC<ErrorPatternSummaryProps> = ({ localUserId }) => {
  const [dist, setDist] = useState<TagDistributionResult | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadGlobal() {
      if (!localUserId) return;
      const res = await getGlobalDistribution(localUserId);
      if (isMounted) setDist(res);
    }

    loadGlobal();
    return () => {
      isMounted = false;
    };
  }, [localUserId]);

  if (!dist || dist.taggedCount === 0) {
    return null; // Don't show if no tags yet
  }

  // Find top error pattern
  const topItem = [...dist.items].sort((a, b) => b.count - a.count)[0];
  const topMeta = topItem ? ERROR_TAG_META[topItem.tag] : null;

  return (
    <div className="error-pattern-dashboard-strip">
      <div className="strip-icon">🎯</div>
      <div className="strip-content">
        <div className="strip-title">Primary Mistake Diagnostic</div>
        <div className="strip-desc">
          Your #1 error cause is <strong style={{ color: topMeta?.colorToken }}>{topMeta?.labelEn}</strong> ({topItem?.percentage}% of tagged misses). Focus on {topMeta?.helperText.toLowerCase()}
        </div>
      </div>
    </div>
  );
};
