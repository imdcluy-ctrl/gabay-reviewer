import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { CATEGORIES } from '../lib/constants';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { BottomNav } from '../components/BottomNav';
import { OfflineBanner } from '../components/OfflineBanner';
import { useUserProfile } from '../hooks/useUserProfile';
import { useEntitlement } from '../hooks/useEntitlement';
import { filterQuestionsForUser } from '../lib/entitlements';
import './CategoryList.css';

export const CategoryList: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { isPremium } = useEntitlement();

  const rawQuestions = useLiveQuery(() => db.questions.toArray()) || [];
  const questions = filterQuestionsForUser(rawQuestions, isPremium);
  const attempts = useLiveQuery(() =>
    profile ? db.attempts.where('local_user_id').equals(profile.id).toArray() : []
  , [profile?.id]);

  const getCategoryStats = (catId: string) => {
    if (!questions || !attempts) {
      return { total: 0, attempted: 0, accuracy: null };
    }

    const catQuestions = questions.filter(q => q.category_id === catId);
    const catQuestionIds = new Set(catQuestions.map(q => q.id));

    const catAttempts = attempts.filter(a => catQuestionIds.has(a.question_id));
    const attemptedQuestionIds = new Set(catAttempts.map(a => a.question_id));

    const total = catQuestions.length;
    const attempted = attemptedQuestionIds.size;

    let accuracy: number | null = null;
    if (catAttempts.length > 0) {
      const correctCount = catAttempts.filter(a => a.is_correct).length;
      accuracy = Math.round((correctCount / catAttempts.length) * 100);
    }

    return { total, attempted, accuracy };
  };

  return (
    <div className="category-list-layout page-wrapper">
      <OfflineBanner />
      <Header title="Study Categories" subtitle="Select a section to practice" />

      <main className="category-list-content">
        <div className="category-grid">
          {CATEGORIES.map(cat => {
            const { total, attempted, accuracy } = getCategoryStats(cat.id);
            const isAvailable = total > 0;
            const progressPercent = total > 0 ? Math.round((attempted / total) * 100) : 0;

            return (
              <Card
                key={cat.id}
                variant={isAvailable ? 'interactive' : 'flat'}
                className={`category-card ${!isAvailable ? 'disabled' : ''}`}
                onClick={() => {
                  navigate(`/study/${cat.id}`);
                }}
              >
                <div className="cat-card-header">
                  <span className="cat-icon">{cat.icon}</span>
                  <div className="cat-title-group">
                    <h3 className="cat-name">{cat.name}</h3>
                    <span className="cat-count">
                      {isAvailable ? `${attempted} of ${total} attempted` : '0 questions'}
                    </span>
                  </div>
                  {!isAvailable && <Badge variant="neutral">Coming soon</Badge>}
                </div>

                {isAvailable && (
                  <div className="cat-card-body">
                    <div className="cat-stats-row">
                      <span className="cat-accuracy-label">Accuracy</span>
                      <span className="cat-accuracy-val">
                        {accuracy !== null ? `${accuracy}%` : '--'}
                      </span>
                    </div>
                    <div className="cat-progress-bar-bg">
                      <div
                        className="cat-progress-bar-fill"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

