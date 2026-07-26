import React from 'react';
import type { SubtopicMasteryItem } from '../../lib/deepAnalytics/types';
import './SubtopicHeatmap.css';

interface SubtopicHeatmapProps {
  items: SubtopicMasteryItem[];
}

export const SubtopicHeatmap: React.FC<SubtopicHeatmapProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return null;
  }

  // Group items by category
  const categoriesMap = new Map<string, SubtopicMasteryItem[]>();
  items.forEach(item => {
    const list = categoriesMap.get(item.categoryName) || [];
    list.push(item);
    categoriesMap.set(item.categoryName, list);
  });

  return (
    <div className="subtopic-heatmap-card">
      <div className="heatmap-header">
        <div>
          <h3 className="heatmap-title">Subtopic Mastery Heatmap</h3>
          <p className="heatmap-subtitle">
            Identifies specific topic gaps based on your performance history.
          </p>
        </div>
        <div className="heatmap-legend">
          <span className="legend-item low">🔴 &lt;50% Weak</span>
          <span className="legend-item mid">🟡 50-79% Growing</span>
          <span className="legend-item high">🟢 ≥80% Mastered</span>
          <span className="legend-item insufficient">⚪ &lt;3 Items Insufficient</span>
        </div>
      </div>

      <div className="heatmap-categories-grid">
        {Array.from(categoriesMap.entries()).map(([categoryName, subtopics]) => (
          <div key={categoryName} className="heatmap-category-group">
            <h4 className="category-group-title">{categoryName}</h4>
            <div className="subtopics-chips-grid">
              {subtopics.map(sub => {
                const pctLabel = sub.heatBin === 'insufficient_data'
                  ? 'Need 3+ items'
                  : `${Math.round(sub.accuracy * 100)}%`;

                return (
                  <div
                    key={sub.subtopic}
                    className={`heatmap-chip ${sub.heatBin}`}
                    title={`${sub.subtopic}: ${sub.totalCorrect}/${sub.totalAnswered} correct`}
                  >
                    <div className="chip-subtopic-name">{sub.subtopic}</div>
                    <div className="chip-pct">{pctLabel}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
