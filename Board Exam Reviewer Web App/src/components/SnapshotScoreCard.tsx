import React from 'react';
import { Card } from './Card';
import type { SnapshotResult } from '../lib/snapshotScore';
import './SnapshotScoreCard.css';

interface Props {
  result: PredictiveResult;
}

export const SnapshotScoreCard: React.FC<Props> = ({ result }) => {
  if (result.trend === "insufficient_data") return null;

  const trendEmoji = result.trend === "improving" ? "??" :
    result.trend === "declining" ? "??" : "??";

  const confidenceColor = result.confidence === "high" ? "var(--color-correct)" :
    result.confidence === "medium" ? "var(--color-brand-gold)" : "var(--color-text-muted)";

  return (
    <Card className="snapshot-card">
      <div className="snapshot-header">
        <span className="snapshot-icon">??</span>
        <h3 className="snapshot-title">Your Practice Snapshot</h3>
      </div>

      <div className="snapshot-score-row">
        <div className="snapshot-score-main">
          <span className="snapshot-score-val">{result.predictedScore}%</span>
          <span className="snapshot-score-ci">±{result.confidenceInterval}%</span>
        </div>
        <div className="snapshot-score-status">
          <span className="snapshot-pass-badge" style={{
            background: result.predictedScore >= 75 ? 'var(--color-correct)' : 'var(--color-incorrect)',
          }}>
            {result.predictedScore >= 75 ? 'STRONG' : 'GROWING'}
          </span>
          <span className="snapshot-trend" style={{ color: confidenceColor }}>
            {trendEmoji} {result.trend}
          </span>
        </div>
      </div>

      <p className="snapshot-message">{result.message}</p>
    </Card>
  );
};
