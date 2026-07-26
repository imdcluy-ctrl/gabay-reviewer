import React from 'react';
import type { ScatterPoint } from '../../lib/deepAnalytics/types';
import './SpeedAccuracyScatter.css';

interface SpeedAccuracyScatterProps {
  points: ScatterPoint[];
}

export const SpeedAccuracyScatter: React.FC<SpeedAccuracyScatterProps> = ({ points }) => {
  if (!points || points.length === 0) {
    return null;
  }

  return (
    <div className="speed-scatter-card">
      <div className="scatter-header">
        <div>
          <h3 className="scatter-title">Speed vs. Accuracy Diagnostic</h3>
          <p className="scatter-subtitle">
            Pacing scatter mapping median time per question against accuracy.
          </p>
        </div>
      </div>

      <div className="scatter-quadrant-wrapper">
        <div className="quadrant q-top-left">
          <span className="q-label">⚡ Fast &amp; Accurately Mastered</span>
        </div>
        <div className="quadrant q-top-right">
          <span className="q-label">🐢 Slow but Thorough Correct</span>
        </div>
        <div className="quadrant q-bottom-left">
          <span className="q-label">💨 Rushed Errors (&lt;20s)</span>
        </div>
        <div className="quadrant q-bottom-right">
          <span className="q-label">⏳ Time Wasters (&gt;120s Wrong)</span>
        </div>
      </div>

      {/* Accessible Data Table Fallback */}
      <div className="scatter-table-fallback">
        <table className="scatter-table">
          <thead>
            <tr>
              <th>Attempt Date</th>
              <th>Median Time / Item</th>
              <th>Accuracy</th>
              <th>Pacing Diagnosis</th>
            </tr>
          </thead>
          <tbody>
            {points.map(pt => {
              const accPct = Math.round(pt.accuracy * 100);
              let diag = 'Optimal Pacing';
              if (pt.medianTimeSpentSeconds > 120 && pt.accuracy < 0.8) diag = 'Time Waster Risk';
              else if (pt.medianTimeSpentSeconds < 20 && pt.accuracy < 0.8) diag = 'Rushed Error Risk';
              else if (accPct >= 80 && pt.medianTimeSpentSeconds <= 60) diag = 'Mastered';

              return (
                <tr key={pt.attemptId}>
                  <td>{pt.dateStr}</td>
                  <td className="mono-col">{pt.medianTimeSpentSeconds}s</td>
                  <td className="mono-col">{accPct}%</td>
                  <td>
                    <span className={`diag-badge ${diag.toLowerCase().replace(/ /g, '-')}`}>
                      {diag}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
