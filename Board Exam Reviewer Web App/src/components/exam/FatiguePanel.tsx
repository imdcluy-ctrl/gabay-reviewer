import React from 'react';
import type { FatigueAnalysis } from '../../lib/fatigue';
import './FatiguePanel.css';

export interface FatiguePanelProps {
  fatigue: FatigueAnalysis;
}

export const FatiguePanel: React.FC<FatiguePanelProps> = ({ fatigue }) => {
  const { quartileAccuracies, hasFatigueDeficit, recommendation } = fatigue;

  const quartiles = [
    quartileAccuracies.q1,
    quartileAccuracies.q2,
    quartileAccuracies.q3,
    quartileAccuracies.q4,
  ];

  return (
    <div className={`fatigue-panel-card ${hasFatigueDeficit ? 'has-deficit' : ''}`}>
      <div className="fatigue-header">
        <h3 className="card-title">🧠 Cognitive Stamina & Fatigue Analysis</h3>
        {hasFatigueDeficit && (
          <span className="fatigue-deficit-badge">INV-023 Stamina Deficit</span>
        )}
      </div>

      <div className="quartile-bars-grid">
        {quartiles.map(q => (
          <div key={q.quartile} className="quartile-item">
            <span className="q-label">Q{q.quartile}</span>
            <div className="q-bar-track">
              <div
                className={`q-bar-fill ${hasFatigueDeficit && q.quartile === 4 ? 'dropped' : 'normal'}`}
                style={{ height: `${q.percentage}%` }}
              />
            </div>
            <span className="q-pct">{q.percentage}%</span>
          </div>
        ))}
      </div>

      <div className="fatigue-recommendation-box">
        <p className="rec-text">{recommendation}</p>
      </div>
    </div>
  );
};
