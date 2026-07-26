import React, { useMemo } from 'react';
import type { QuestionHealthRecord } from './hooks/useContentHealth';
import { CATEGORIES } from '../../lib/constants';
import './SubtopicBreakdown.css';

interface SubtopicBreakdownProps {
  records: QuestionHealthRecord[];
}

interface SubtopicStat {
  categoryId: string;
  categoryName: string;
  subtopic: string;
  totalAttempts: number;
  failRate: number;
}

export const SubtopicBreakdown: React.FC<SubtopicBreakdownProps> = ({ records }) => {
  const subtopicStats = useMemo(() => {
    const map = new Map<string, { categoryId: string; subtopic: string; attempts: number; failed: number }>();

    records.forEach(r => {
      const key = `${r.subjectArea}:${r.subtopic}`;
      const existing = map.get(key) || {
        categoryId: r.subjectArea,
        subtopic: r.subtopic,
        attempts: 0,
        failed: 0,
      };

      const failedCount = Math.round(r.failRate * r.attemptCount);
      existing.attempts += r.attemptCount;
      existing.failed += failedCount;
      map.set(key, existing);
    });

    const stats: SubtopicStat[] = [];
    map.forEach(item => {
      const categoryName = CATEGORIES.find(c => c.id === item.categoryId)?.name || item.categoryId;
      const failRate = item.attempts > 0 ? item.failed / item.attempts : 0;
      stats.push({
        categoryId: item.categoryId,
        categoryName,
        subtopic: item.subtopic,
        totalAttempts: item.attempts,
        failRate,
      });
    });

    return stats.sort((a, b) => b.failRate - a.failRate);
  }, [records]);

  return (
    <div className="subtopic-breakdown-container">
      <h3>Subtopic Failure Rate Breakdown</h3>
      <p className="subtopic-subtext">Topics with high failure rates indicate content gaps or difficult concepts requiring study guides.</p>

      <div className="subtopic-list">
        {subtopicStats.length === 0 ? (
          <div className="empty-subtopic-text">No subtopic attempt data available yet.</div>
        ) : (
          subtopicStats.map(s => {
            const failPct = Math.round(s.failRate * 100);
            return (
              <div key={`${s.categoryId}-${s.subtopic}`} className="subtopic-item">
                <div className="subtopic-header">
                  <span className="subtopic-name">{s.subtopic} <span className="cat-tag">({s.categoryName})</span></span>
                  <span className={`subtopic-fail-pct ${failPct >= 50 ? 'high' : ''}`}>{failPct}% Fail Rate ({s.totalAttempts} attempts)</span>
                </div>
                <div className="subtopic-bar-bg">
                  <div
                    className={`subtopic-bar-fill ${failPct >= 70 ? 'danger' : failPct >= 50 ? 'warning' : 'normal'}`}
                    style={{ width: `${Math.min(failPct, 100)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
