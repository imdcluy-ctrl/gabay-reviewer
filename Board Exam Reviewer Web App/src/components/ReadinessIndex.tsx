import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import { calculateReadinessIndex, type ReadinessResult } from '../lib/readinessIndex';
import { Card } from './Card';
import { Button } from './Button';
import './ReadinessIndex.css';

export const ReadinessIndex: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [readiness, setReadiness] = useState<ReadinessResult | null>(null);

  useEffect(() => {
    async function loadPRI() {
      if (!profile) return;
      setIsLoading(true);
      const res = await calculateReadinessIndex(profile.id, profile.exam_date || null);
      setReadiness(res);
      setIsLoading(false);
    }
    loadPRI();
  }, [profile]);

  if (isLoading || !readiness) {
    return (
      <Card className="readiness-card loading">
        <div className="spinner" />
        <p>Calculating Predictive Readiness Index...</p>
      </Card>
    );
  }

  const { score, band, factors, projection, categories, isColdStart } = readiness;

  return (
    <Card className="readiness-card">
      <div className="readiness-header">
        <div className="readiness-title-group">
          <h2>Predictive Readiness Index (PRI)</h2>
          {profile?.exam_date && (
            <span className="exam-countdown-badge">
              🎯 Exam Date: {new Date(profile.exam_date).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* L8: Conditional "Take Mock Exam" CTA if cold-start */}
        {isColdStart && (
          <Button variant="primary" size="sm" onClick={() => navigate('/exam/cse-professional-v1')}>
            Take Full Simulation Exam ➔
          </Button>
        )}
      </div>

      {/* Main Score Ring & Band Display (M2, L3) */}
      <div className="score-ring-row">
        <div className="pri-score-circle">
          <span className="pri-number">{score}</span>
          <span className="pri-max">/ 100</span>
        </div>

        <div className="pri-meta">
          <div className="band-badge-wrapper">
            <span className={`pri-band-badge ${band.toLowerCase().replace(' ', '-')}`}>
              {band}
            </span>
            {isColdStart && <span className="cold-start-tag">Cold-Start Baseline</span>}
          </div>

          <p className="projection-summary">
            🚀 <strong>{projection.daysToReady} days</strong> estimated to reach Highly Ready at{' '}
            <strong>{projection.recommendedDailyQuestions} daily questions</strong> pace.
          </p>
        </div>
      </div>

      {/* M3: Top 3 Actionable Improvement Factors */}
      <div className="factors-section">
        <h3>Top Actionable Improvement Factors</h3>
        <div className="factors-grid">
          {factors.map((f, i) => (
            <div key={i} className={`factor-item ${f.impact}`}>
              <div className="factor-header">
                <span className="factor-title">{f.title}</span>
                <span className="impact-badge">{f.impact.toUpperCase()}</span>
              </div>
              <p className="factor-action">{f.action}</p>
            </div>
          ))}
        </div>
      </div>

      {/* L3: Category Breakdown Grid */}
      <div className="category-readiness-section">
        <h3>Category Mastery Breakdown</h3>
        <div className="category-badges-grid">
          {categories.map(cat => (
            <div key={cat.category_id} className={`cat-tier-box ${cat.tier}`}>
              <span className="cat-name">{cat.category_name}</span>
              <span className="cat-stat">{cat.accuracy_pct}%</span>
              <span className="tier-label">
                {cat.tier === 'exam_ready' && '🟢 Exam-Ready'}
                {cat.tier === 'developing' && '🟡 Developing'}
                {cat.tier === 'at_risk' && '🔴 At-Risk'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* L1: Honesty Disclaimer Footer */}
      <footer className="readiness-disclaimer">
        ℹ️ <em>Estimated readiness based on your practice patterns — not a guaranteed outcome.</em>
      </footer>
    </Card>
  );
};

export default ReadinessIndex;
