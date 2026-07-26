import React from 'react';
import { Card } from './Card';
import type { PredictiveResult } from '../lib/predictiveScore';
import './PredictiveScoreCard.css';

interface Props {
  result: PredictiveResult;
}

export const PredictiveScoreCard: React.FC<Props> = ({ result }) => {
  if (result.trend === "insufficient_data") return null;

  const trendEmoji = result.trend === "improving" ? "??" :
    result.trend === "declining" ? "??" : "??";

  const confidenceColor = result.confidence === "high" ? "var(--color-correct)" :
    result.confidence === "medium" ? "var(--color-brand-gold)" : "var(--color-text-muted)";

  return (
    <Card className="predictive-card">
      <div className="predictive-header">
        <span className="predictive-icon">??</span>
        <h3 className="predictive-title">Predicted CSE Score</h3>
      </div>

      <div className="predictive-score-row">
        <div className="predictive-score-main">
          <span className="predictive-score-val">{result.predictedScore}%</span>
          <span className="predictive-score-ci">±{result.confidenceInterval}%</span>
        </div>
        <div className="predictive-score-status">
          <span className="predictive-pass-badge" style={{
            background: result.predictedScore >= 75 ? 'var(--color-correct)' : 'var(--color-incorrect)',
          }}>
            {result.predictedScore >= 75 ? 'PASS' : 'NEED WORK'}
          </span>
          <span className="predictive-trend" style={{ color: confidenceColor }}>
            {trendEmoji} {result.trend}
          </span>
        </div>
      </div>

      <p className="predictive-message">{result.message}</p>
    </Card>
  );
};
