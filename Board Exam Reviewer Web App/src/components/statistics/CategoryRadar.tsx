import React from 'react';
import type { CategoryRadarItem } from '../../lib/deepAnalytics/types';
import './CategoryRadar.css';

interface CategoryRadarProps {
  items: CategoryRadarItem[];
}

export const CategoryRadar: React.FC<CategoryRadarProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="category-radar-card">
      <div className="radar-header">
        <div>
          <h3 className="radar-title">5-Category Subject Radar vs. Official CSC 80% Cutoff</h3>
          <p className="radar-subtitle">
            Reference target line set at 80% passing accuracy across all CSE subject domains.
          </p>
        </div>
      </div>

      <div className="radar-categories-grid">
        {items.map(cat => {
          const userPct = Math.round(cat.userAccuracy * 100);
          const passPct = Math.round(cat.passingTarget * 100);
          const isPassed = cat.userAccuracy >= cat.passingTarget;

          return (
            <div key={cat.categoryId} className={`radar-cat-box ${isPassed ? 'passed' : 'needs-work'}`}>
              <div className="cat-box-header">
                <span className="cat-name">{cat.categoryName}</span>
                <span className={`cat-status-badge ${isPassed ? 'passed' : 'needs-work'}`}>
                  {isPassed ? 'PASSED (≥80%)' : 'NEEDS WORK'}
                </span>
              </div>

              <div className="cat-progress-stack">
                <div className="progress-row">
                  <span className="row-label">Your Mastery:</span>
                  <div className="bar-track">
                    <div
                      className={`bar-fill ${isPassed ? 'passed' : 'needs-work'}`}
                      style={{ width: `${userPct}%` }}
                    />
                    {/* Reference Line at 80% */}
                    <div className="reference-line-80" style={{ left: '80%' }} title="CSC 80% Passing Cutoff" />
                  </div>
                  <span className="row-val">{userPct}%</span>
                </div>
              </div>

              <div className="cat-box-footer">
                <span>Attempted: <strong>{cat.totalCorrect}/{cat.totalAnswered}</strong> correct</span>
                <span>Target: <strong>{passPct}%</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
