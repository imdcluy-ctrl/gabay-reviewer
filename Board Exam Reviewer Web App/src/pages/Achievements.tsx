import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { useAchievements } from '../hooks/useAchievements';
import './Achievements.css';

export const Achievements: React.FC = () => {
  const navigate = useNavigate();
  const { allAchievements, unlockedAchievements, lockedAchievements, progress, total } = useAchievements();

  const categoryLabels: Record<string, string> = {
    progress: 'Progress',
    streak: 'Streaks',
    mastery: 'Mastery',
    special: 'Special',
  };

  const categoryEmojis: Record<string, string> = {
    progress: '📈',
    streak: '🔥',
    mastery: '🧠',
    special: '🎖',
  };

  const categories = ['progress', 'streak', 'mastery', 'special'] as const;

  return (
    <div className="achievements-layout page-wrapper">
      <Header
        title="Achievements"
        showBack
        onBack={() => navigate(-1)}
      />
      <main className="achievements-content">
        <div className="achievements-summary">
          <span className="achievements-summary-icon">🏆</span>
          <div className="achievements-summary-text">
            <strong>{progress} / {total} Unlocked</strong>
            <div className="achievements-progress-bg">
              <div className="achievements-progress-fill" style={{ width: `${(progress / total) * 100}%` }} />
            </div>
          </div>
        </div>

        {categories.map(cat => {
          const catUnlocked = allAchievements.filter(a => a.category === cat && unlockedAchievements.includes(a));
          const catLocked = allAchievements.filter(a => a.category === cat && lockedAchievements.includes(a));
          if (catUnlocked.length === 0 && catLocked.length === 0) return null;

          return (
            <div key={cat} className="achievement-category">
              <h3 className="achievement-category-title">
                {categoryEmojis[cat]} {categoryLabels[cat]}
                <span className="achievement-category-count">
                  {catUnlocked.length}/{catUnlocked.length + catLocked.length}
                </span>
              </h3>
              <div className="achievement-grid">
                {catUnlocked.map(a => (
                  <Card key={a.id} className="achievement-card unlocked">
                    <span className="achievement-emoji">{a.emoji}</span>
                    <div className="achievement-info">
                      <strong className="achievement-name">{a.title}</strong>
                      <p className="achievement-desc">{a.description}</p>
                    </div>
                  </Card>
                ))}
                {catLocked.map(a => (
                  <Card key={a.id} className="achievement-card locked">
                    <span className="achievement-emoji locked-emoji">🔒</span>
                    <div className="achievement-info">
                      <strong className="achievement-name locked-name">{a.hidden ? '???' : a.title}</strong>
                      <p className="achievement-desc">{a.hidden ? 'Keep studying to discover this achievement!' : a.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
};
