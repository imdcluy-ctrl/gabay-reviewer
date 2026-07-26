import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { useUserProfile } from '../hooks/useUserProfile';
import './MasteryHeatmap.css';

function getColor(accuracy: number, total: number): string {
  if (total === 0) return '#ebedf0';
  if (accuracy >= 90) return '#0d4a14';
  if (accuracy >= 75) return '#196127';
  if (accuracy >= 50) return '#239a3b';
  if (accuracy >= 30) return '#7bc96f';
  return '#c6e48b';
}

export const MasteryHeatmap: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { profile } = useUserProfile();
  const attempts = useLiveQuery(
    () => profile ? db.attempts.where('local_user_id').equals(profile.id).toArray() : [],
    [profile?.id]
  );
  const questions = useLiveQuery(() => db.questions.toArray());

  const subtopicScores = React.useMemo(() => {
    if (!attempts || !questions) return [];
    const scoreMap: Record<string, { total: number; correct: number }> = {};
    attempts.forEach(a => {
      const q = questions.find(q => q.id === a.question_id);
      if (!q) return;
      const key = q.subtopic || q.subtopic_id || 'Other';
      if (!scoreMap[key]) scoreMap[key] = { total: 0, correct: 0 };
      scoreMap[key].total++;
      if (a.is_correct) scoreMap[key].correct++;
    });
    return Object.entries(scoreMap).map(([subtopic, data]) => ({
      subtopic,
      total: data.total,
      correct: data.correct,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    })).sort((a, b) => b.total - a.total);
  }, [attempts, questions]);

  if (!profile || subtopicScores.length === 0) {
    return <div className="mastery-empty"><p>Answer more questions to see your mastery!</p></div>;
  }

  return (
    <div className={'mastery-heatmap' + (compact ? ' compact' : '')}>
      <h4 className="mastery-category-title">Topic Mastery</h4>
      <div className="mastery-grid">
        {subtopicScores.slice(0, 12).map(score => (
          <div key={score.subtopic} className="mastery-cell"
            style={{ backgroundColor: getColor(score.accuracy, score.total) }}
            title={score.subtopic + ': ' + score.accuracy + '%'}>
            <span className="mastery-cell-label">
              {score.subtopic.replace(/-/g, ' ').substring(0, 3).toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
