import React from 'react';
import type { SubtopicDiagnostic } from '../../lib/scoring';
import './SubtopicRadarChart.css';

export interface SubtopicRadarChartProps {
  diagnostics: SubtopicDiagnostic[];
}

export const SubtopicRadarChart: React.FC<SubtopicRadarChartProps> = ({ diagnostics }) => {
  const weakItems = diagnostics.filter(d => d.is_weak);

  return (
    <div className="subtopic-radar-card">
      <h3 className="card-title">Subtopic Mastery Diagnostics</h3>

      {weakItems.length > 0 && (
        <div className="weak-alert-banner">
          ⚠️ <strong>{weakItems.length} Weak Subtopics Detected (&lt;60% Accuracy):</strong> Priority review recommended before test day.
        </div>
      )}

      <div className="subtopics-list-grid">
        {diagnostics.map(sub => (
          <div key={sub.subtopic} className={`subtopic-item-row ${sub.is_weak ? 'weak' : 'strong'}`}>
            <div className="sub-header-line">
              <span className="sub-name">{sub.subtopic}</span>
              <span className="sub-pct">{Math.round(sub.accuracy_ratio * 100)}%</span>
            </div>

            <div className="sub-mini-track">
              <div
                className={`sub-mini-fill ${sub.is_weak ? 'weak' : 'strong'}`}
                style={{ width: `${Math.round(sub.accuracy_ratio * 100)}%` }}
              />
            </div>

            <span className="sub-count">{sub.correct} / {sub.total} items</span>
          </div>
        ))}
      </div>
    </div>
  );
};
