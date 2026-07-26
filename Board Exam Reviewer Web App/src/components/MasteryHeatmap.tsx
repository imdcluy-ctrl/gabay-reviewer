import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { useUserProfile } from '../hooks/useUserProfile';
import { CATEGORIES } from '../lib/constants';
import './MasteryHeatmap.css';

interface SubtopicScore {
  subtopic: string;
  categoryId: string;
  total: number;
  correct: number;
  accuracy: number;
}

const COLORS = [
  '#ebedf0', // 0: untouched
  '#c6e48b', // 1-29%
  '#7bc96f', // 30-49%
  '#239a3b', // 50-74%
  '#196127', // 75-89%
  '#0d4a14', // 90-100%
];

function getColor(accuracy: number, total: number): string {
  if (total === 0) return COLORS[0];
  if (accuracy >= 90) return COLORS[5];
  if (accuracy >= 75) return COLORS[4];
  if (accuracy >= 50) return COLORS[3];
  if (accuracy >= 30) return COLORS[2];
  return COLORS[1];
}

function getTooltip(score: SubtopicScore): string {
  if (score.total === 0) return score.subtopic + ': No attempts yet';
  return score.subtopic + ': ' + score.accuracy + '% (' + score.correct + '/' + score.total + ')';
}

export const MasteryHeatmap: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { profile } = useUserProfile();

  const attempts = useLiveQuery(
    () => profile ? db.attempts.where('local_user_id').equals(profile.id).toArray() : [],
    [profile?.id]
  );

  const questions = useLiveQuery(() => db.questions.toArray()) || [];

  // Calculate scores per subtopic
  const subtopicScores = React.useMemo(() => {
    if (!attempts || !questions.length) return [];

    const scoreMap: Record<string, { total: number; correct: number; categoryId: string }> = {};

    attempts.forEach(a => {
      const q = questions.find(q => q.id === a.question_id);
      if (!q) return;
      const key = q.subtopic_id || q.subtopic || 'Other';
      if (!scoreMap[key]) {
        scoreMap[key] = { total: 0, correct: 0, categoryId: q.category_id };
      }
      scoreMap[key].total++;
      if (a.is_correct) scoreMap[key].correct++;
    });

    return Object.entries(scoreMap).map(([subtopic, data]) => ({
      subtopic,
      categoryId: data.categoryId,
      total: data.total,
      correct: data.correct,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    })).sort((a, b) => b.total - a.total);
  }, [attempts, questions]);

  if (!profile || subtopicScores.length === 0) {
    return (
      <div className="mastery-empty">
        <p>Answer some questions to see your mastery heatmap!</p>
      </div>
    );
  }

  return (
    <div className={'mastery-heatmap' + (compact ? ' compact' : '')}>
      {CATEGORIES.map(cat => {
        const catScores = subtopicScores.filter(s => s.categoryId === cat.id);
        if (catScores.length === 0) return null;

        return (
          <div key={cat.id} className="mastery-category">
            <h4 className="mastery-category-title">{cat.icon} {cat.name}</h4>
            <div className="mastery-grid">
              {catScores.map(score => (
                <div
                  key={score.subtopic}
                  className="mastery-cell"
                  style={{ backgroundColor: getColor(score.accuracy, score.total) }}
                  title={getTooltip(score)}
                >
                  <span className="mastery-cell-label">
                    {score.subtopic.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).substring(0, 3)}
                  </span>
                  <span className="mastery-cell-pct">{score.total > 0 ? score.accuracy + '%' : ''}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
