import React, { useEffect, useState } from 'react';
import { ERROR_TAG_META, type TagDistributionResult } from '../lib/errorTags';
import { getAttemptDistribution } from '../lib/errorTagRepository';
import './ErrorDistributionWidget.css';

interface ErrorDistributionWidgetProps {
  attemptId: string;
  onOpenReview?: () => void;
}

export const ErrorDistributionWidget: React.FC<ErrorDistributionWidgetProps> = ({
  attemptId,
  onOpenReview,
}) => {
  const [distribution, setDistribution] = useState<TagDistributionResult | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadDistribution() {
      const res = await getAttemptDistribution(attemptId);
      if (isMounted) {
        setDistribution(res);
      }
    }

    loadDistribution();
    return () => {
      isMounted = false;
    };
  }, [attemptId]);

  if (!distribution || distribution.totalIncorrect === 0) {
    return null; // Empty state / no incorrect items
  }

  const { totalIncorrect, taggedCount, items } = distribution;

  return (
    <div className="error-distribution-card">
      <div className="dist-header">
        <div>
          <h3 className="dist-title">Metacognitive Error Breakdown</h3>
          <p className="dist-subtitle">
            Tagged {taggedCount} of {totalIncorrect} incorrect answers
          </p>
        </div>
        {onOpenReview && (
          <button type="button" className="review-cta-btn" onClick={onOpenReview}>
            Review Answers ➔
          </button>
        )}
      </div>

      <div className="dist-bars">
        {items.map(item => {
          const meta = ERROR_TAG_META[item.tag];
          return (
            <div key={item.tag} className="dist-row">
              <div className="dist-label-col">
                <span
                  className="dist-tag-dot"
                  style={{ backgroundColor: meta.colorToken }}
                />
                <span className="dist-tag-name">{meta.labelEn}</span>
              </div>

              <div className="dist-bar-col">
                <div className="dist-bar-track">
                  <div
                    className="dist-bar-fill"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: meta.colorToken,
                    }}
                  />
                </div>
              </div>

              <div className="dist-val-col">
                <span className="dist-count">{item.count}</span>
                <span className="dist-pct">({item.percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
