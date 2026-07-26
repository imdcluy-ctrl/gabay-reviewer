import React from 'react';
import type { StaminaPoint } from '../../lib/deepAnalytics/types';
import './StaminaProgressionChart.css';

interface StaminaProgressionChartProps {
  points: StaminaPoint[];
}

export const StaminaProgressionChart: React.FC<StaminaProgressionChartProps> = ({ points }) => {
  if (!points || points.length === 0) {
    return null;
  }

  return (
    <div className="stamina-chart-card">
      <div className="stamina-header">
        <div>
          <h3 className="stamina-title">Chronological Stamina &amp; Fatigue Progression</h3>
          <p className="stamina-subtitle">
            Tracks accuracy drop from Q1 (First 25% of exam) to Q4 (Final 25% of exam).
          </p>
        </div>
      </div>

      <div className="stamina-points-list">
        {points.map((pt, idx) => {
          const q1Pct = Math.round(pt.q1Accuracy * 100);
          const q4Pct = Math.round(pt.q4Accuracy * 100);
          const dropPp = Math.round(pt.fatigueDelta * 100);

          return (
            <div
              key={pt.attemptId}
              className={`stamina-row ${pt.hasFatigueWarning ? 'fatigue-alert' : ''}`}
            >
              <div className="stamina-attempt-info">
                <span className="attempt-badge">Mock #{idx + 1}</span>
                <span className="attempt-date">{pt.dateStr}</span>
              </div>

              <div className="stamina-bars-group">
                <div className="bar-subrow">
                  <span className="bar-lbl">Q1 Accuracy:</span>
                  <div className="bar-track">
                    <div className="bar-fill q1" style={{ width: `${q1Pct}%` }} />
                  </div>
                  <span className="bar-val">{q1Pct}%</span>
                </div>

                <div className="bar-subrow">
                  <span className="bar-lbl">Q4 Accuracy:</span>
                  <div className="bar-track">
                    <div className="bar-fill q4" style={{ width: `${q4Pct}%` }} />
                  </div>
                  <span className="bar-val">{q4Pct}%</span>
                </div>
              </div>

              <div className="stamina-status-col">
                {pt.hasFatigueWarning ? (
                  <span className="fatigue-warning-badge" title="Accuracy dropped >= 15pp from start to finish">
                    ⚠️ {dropPp}pp Fatigue Drop (INV-023)
                  </span>
                ) : (
                  <span className="stamina-stable-badge">
                    ✅ Stable Stamina ({dropPp > 0 ? `-${dropPp}pp` : `+${Math.abs(dropPp)}pp`})
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
