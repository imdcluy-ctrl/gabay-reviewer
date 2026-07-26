import React from 'react';
import type { PacingAnalysis } from '../../lib/pacing';
import './PacingAnalysisPanel.css';

export interface PacingAnalysisPanelProps {
  pacing: PacingAnalysis;
}

export const PacingAnalysisPanel: React.FC<PacingAnalysisPanelProps> = ({ pacing }) => {
  const { overall_avg_seconds, time_wasters, rushed_incorrect, optimal_range_pct } = pacing;

  return (
    <div className="pacing-panel-card">
      <h3 className="card-title">⏱ Exam Pacing & Speed Diagnostics</h3>

      <div className="pacing-metrics-grid">
        <div className="pacing-metric-box">
          <span className="pacing-val">{overall_avg_seconds}s</span>
          <span className="pacing-lbl">Average Time per Question</span>
        </div>

        <div className="pacing-metric-box">
          <span className="pacing-val">{optimal_range_pct}%</span>
          <span className="pacing-lbl">Optimal Speed Band (30–90s)</span>
        </div>

        <div className={`pacing-metric-box ${time_wasters.length > 0 ? 'warning' : ''}`}>
          <span className="pacing-val">{time_wasters.length}</span>
          <span className="pacing-lbl">Time Wasters (&gt;120s & Incorrect)</span>
        </div>

        <div className={`pacing-metric-box ${rushed_incorrect.length > 0 ? 'warning' : ''}`}>
          <span className="pacing-val">{rushed_incorrect.length}</span>
          <span className="pacing-lbl">Rushed Errors (&lt;20s & Incorrect)</span>
        </div>
      </div>

      {time_wasters.length > 0 && (
        <div className="pacing-insight-box danger">
          🚨 <strong>Time-Waster Warning:</strong> You spent over 2 minutes on {time_wasters.length} question(s) and still got them wrong. Consider skipping and flagging hard items earlier to save stamina.
        </div>
      )}

      {rushed_incorrect.length > 0 && (
        <div className="pacing-insight-box warning">
          ⚡ <strong>Careless Rush Warning:</strong> You spent under 20 seconds on {rushed_incorrect.length} question(s) and missed them. Re-read options carefully before confirming.
        </div>
      )}
    </div>
  );
};
