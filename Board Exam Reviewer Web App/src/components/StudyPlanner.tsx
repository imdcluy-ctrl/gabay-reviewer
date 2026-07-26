import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { useUserProfile } from '../hooks/useUserProfile';
import { useStreak } from '../hooks/useStreak';
import { generateStudyPlan } from '../lib/studyPlanner';
import { Card } from './Card';
import { Button } from './Button';
import './StudyPlanner.css';

export const StudyPlanner: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();

  const attempts = useLiveQuery(
    () => profile ? db.attempts.where('local_user_id').equals(profile.id).toArray() : [],
    [profile?.id]
  );
  const questions = useLiveQuery(() => db.questions.toArray()) || [];

  const plan = React.useMemo(() => {
    if (!attempts || !questions.length || !profile?.exam_date) return null;

    // Calculate per-category accuracies
    const catMap: Record<string, { correct: number; total: number }> = {};
    attempts.forEach(a => {
      const q = questions.find(q => q.id === a.question_id);
      if (!q) return;
      if (!catMap[q.category_id]) catMap[q.category_id] = { correct: 0, total: 0 };
      catMap[q.category_id].total++;
      if (a.is_correct) catMap[q.category_id].correct++;
    });

    const catAccuracies = Object.entries(catMap).map(([catId, data]) => ({
      categoryId: catId,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      questionsAnswered: data.total,
    }));

    return generateStudyPlan(catAccuracies, profile.exam_date, questions.length);
  }, [attempts, questions, profile?.exam_date]);

  if (!profile?.exam_date) {
    return (
      <Card className="study-planner-card">
        <div className="sp-header">
          <span className="sp-icon">{'📅'}</span>
          <div>
            <h3 className="sp-title">Smart Study Planner</h3>
            <p className="sp-subtitle">Set your exam date in Settings to get a personalized plan.</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate('/settings')}>
          Set Exam Date
        </Button>
      </Card>
    );
  }

  if (!plan) {
    return (
      <Card className="study-planner-card">
        <div className="sp-header">
          <span className="sp-icon">{'📅'}</span>
          <div>
            <h3 className="sp-title">Smart Study Planner</h3>
            <p className="sp-subtitle">Answer more questions to generate your study plan.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="study-planner-card">
      <div className="sp-header">
        <span className="sp-icon">{'📅'}</span>
        <div>
          <h3 className="sp-title">Smart Study Planner</h3>
          <p className="sp-days">
            {plan.daysUntilExam} days until exam {'· '}
            {plan.dailyMinutes} min/day target
          </p>
        </div>
      </div>

      <div className="sp-score-row">
        <div className="sp-score">
          <span className="sp-score-label">Current</span>
          <span className="sp-score-val">{plan.currentScore}%</span>
        </div>
        <div className="sp-score-arrow">{'→'}</div>
        <div className="sp-score">
          <span className="sp-score-label">Target</span>
          <span className="sp-score-val target">{plan.targetScore}%</span>
        </div>
      </div>

      <p className="sp-message">{plan.message}</p>

      <div className="sp-categories">
        {plan.categoryPlans.map(cat => (
          <div key={cat.categoryId} className={'sp-cat-item priority-' + cat.priority}>
            <div className="sp-cat-header">
              <span className="sp-cat-name">{cat.categoryName}</span>
              <span className={'sp-cat-badge badge-' + cat.priority}>
                {cat.priority === 'high' ? 'FOCUS' : cat.priority === 'medium' ? 'MAINTAIN' : 'REVIEW'}
              </span>
            </div>
            <div className="sp-cat-stats">
              <span>{cat.currentAccuracy}% {'→'} {cat.targetAccuracy}%</span>
              <span>{cat.minutesPerDay} min/day {'·'} {cat.questionsRecommended} Qs</span>
            </div>
            <div className="sp-cat-bar-bg">
              <div
                className="sp-cat-bar-fill"
                style={{
                  width: Math.min(100, (cat.currentAccuracy / cat.targetAccuracy) * 100) + '%',
                  backgroundColor: cat.priority === 'high' ? 'var(--color-incorrect)' :
                    cat.priority === 'medium' ? 'var(--color-brand-gold)' : 'var(--color-correct)'
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <Button variant="primary" size="md" fullWidth onClick={() => navigate('/study')}>
        Start Studying
      </Button>
    </Card>
  );
};
