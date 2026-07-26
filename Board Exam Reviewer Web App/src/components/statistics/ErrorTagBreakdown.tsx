import React from 'react';
import type { ErrorTagStatItem } from '../../lib/deepAnalytics/types';
import { ERROR_TAG_META } from '../../lib/errorTags';
import './ErrorTagBreakdown.css';

interface ErrorTagBreakdownProps {
  items: ErrorTagStatItem[];
}

export const ErrorTagBreakdown: React.FC<ErrorTagBreakdownProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return null;
  }

  const sorted = [...items].sort((a, b) => b.count - a.count);

  return (
    <div className="error-breakdown-card">
      <div className="breakdown-header">
        <div>
          <h3 className="breakdown-title">Metacognitive Error Tag Distribution</h3>
          <p className="breakdown-subtitle">
            Self-tagged mistake reasons across your review sessions (§3.1, INV-026).
          </p>
        </div>
      </div>

      <div className="breakdown-tags-list">
        {sorted.map(item => {
          const meta = ERROR_TAG_META[item.tag];
          if (!meta) return null;

          return (
            <div key={item.tag} className="tag-breakdown-row">
              <div className="tag-label-col">
                <span className="tag-title-en">{meta.labelEn}</span>
                <span className="tag-title-tl">({meta.labelTl})</span>
              </div>

              <div className="tag-bar-col">
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${item.percentage}%` }} />
                </div>
              </div>

              <div className="tag-stat-col">
                <span className="count-badge">{item.count} items</span>
                <span className="pct-val">{item.percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
