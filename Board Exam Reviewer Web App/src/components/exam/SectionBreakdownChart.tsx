import React from 'react';
import type { SectionScore } from '../../lib/scoring';
import './SectionBreakdownChart.css';

export interface SectionBreakdownChartProps {
  sections: SectionScore[];
}

export const SectionBreakdownChart: React.FC<SectionBreakdownChartProps> = ({ sections }) => {
  return (
    <div className="section-breakdown-card">
      <h3 className="card-title">Section Accuracy & Timing Breakdown</h3>

      <div className="section-bars-list">
        {sections.map(sec => (
          <div key={sec.section_id} className="section-bar-item">
            <div className="section-info-row">
              <span className="sec-title">{sec.section_name}</span>
              <span className="sec-score-stat">
                <strong>{sec.correct} / {sec.total}</strong> ({sec.percentage}%)
              </span>
            </div>

            <div className="sec-progress-track">
              <div
                className={`sec-progress-fill ${sec.percentage >= 80 ? 'good' : 'warning'}`}
                style={{ width: `${sec.percentage}%` }}
              />
            </div>

            <div className="sec-timing-meta">
              <span>⏱ Total Spent: <strong>{Math.round(sec.time_spent_seconds / 60)}m</strong></span>
              <span>⚡ Avg Pacing: <strong>{sec.avg_seconds_per_question}s / q</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
