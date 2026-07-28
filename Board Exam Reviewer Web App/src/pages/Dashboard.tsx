import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { CATEGORIES } from '../lib/constants';
import { collectReadinessData } from '../lib/readinessData';
import { useUserProfile } from '../hooks/useUserProfile';
import { useStreak } from '../hooks/useStreak';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { BottomNav } from '../components/BottomNav';
import { OfflineBanner } from '../components/OfflineBanner';
import { SoundToggle } from '../components/SoundToggle';
import { SWUpdateBadge } from '../components/SWUpdateBadge';
import { useAchievements } from '../hooks/useAchievements';
import { AchievementToast } from '../components/AchievementToast';
import { useSound } from '../hooks/useSound';
import { StreakCelebration } from '../components/StreakCelebration';
import { MockExamLauncher } from '../components/MockExamLauncher';
import { useXP } from '../hooks/useXP';
import { XPBadge } from '../components/XPBadge';
import { FooterDisclaimer } from '../components/FooterDisclaimer';
import { AdUnit } from '../components/AdUnit';
import { useEntitlement } from '../hooks/useEntitlement';
import { filterQuestionsForUser } from '../lib/entitlements';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { currentStreak } = useStreak();
  const { isPremium } = useEntitlement();


  const rawQuestions = useLiveQuery(() => db.questions.toArray()) || [];
  const questions = filterQuestionsForUser(rawQuestions, isPremium);
  const attempts = useLiveQuery(() =>
    profile ? db.attempts.where('local_user_id').equals(profile.id).toArray() : []
  , [profile?.id]);

  // Determine Continue Studying target category
  const getContinueCategory = () => {
    if (!questions || !attempts || attempts.length === 0) {
      return { categoryId: 'numerical-ability', name: 'Numerical Ability — Ratio & Proportion' };
    }

    const wrongMap = new Map<string, number>();
    const correctSet = new Set<string>();

    attempts.forEach(a => {
      if (a.is_correct) {
        correctSet.add(a.question_id);
      } else {
        wrongMap.set(a.question_id, (wrongMap.get(a.question_id) || 0) + 1);
      }
    });

    for (const [qId] of wrongMap) {
      if (!correctSet.has(qId)) {
        const q = questions.find(item => item.id === qId);
        if (q) {
          const catObj = CATEGORIES.find(c => c.id === q.category_id);
          return { categoryId: q.category_id, name: `${catObj?.name || 'Practice'} — Review Weak Items` };
        }
      }
    }

    return { categoryId: 'numerical-ability', name: 'Numerical Ability — Practice Session' };
  };

  const continueCat = getContinueCategory();

  const getCategoryQuestionCount = (catId: string) => {
    return questions.filter(q => q.category_id === catId).length;
  };

  // Calculate days remaining to exam
  const daysToExam = React.useMemo(() => {
    if (!profile?.exam_date) return null;
    const examTime = new Date(profile.exam_date).getTime();
    const nowTime = new Date().getTime();
    const diff = Math.ceil((examTime - nowTime) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [profile?.exam_date]);

  // Calculate Bayesian-adjusted readiness score
    


  // Phase B Readiness Score
  const [readiness, setReadiness] = React.useState(null);
  const [readinessLoading, setReadinessLoading] = React.useState(true);

  React.useEffect(() => {
    if (!profile?.id) return;
    setReadinessLoading(true);
    import("../lib/readinessData").then(m => m.collectReadinessData(profile.id)).then(inputs => {
      import("../lib/readinessScore").then(m => {
        setReadiness(m.calculateReadiness(inputs));
        setReadinessLoading(false);
      });
    });
  }, [profile?.id]);

  // Celebrate streak milestones with sound
  const sound = useSound();
  const prevStreakRef = React.useRef(currentStreak);
  React.useEffect(() => {
    const milestones = [3, 7, 14, 21, 30, 60, 100];
    if (currentStreak > prevStreakRef.current && milestones.includes(currentStreak)) {
      sound.play('achievement');
    }
    prevStreakRef.current = currentStreak;
  }, [currentStreak, sound]);
  const xp = useXP();
  const achievements = useAchievements();
  const [showStreakCelebration, setShowStreakCelebration] = React.useState(false);
  const streakCelebRef = React.useRef(currentStreak);

  // Detect streak milestone celebrations (separate from sound milestone)
  React.useEffect(() => {
    const milestones = [3, 7, 14, 21, 30, 60, 100];
    const prev = streakCelebRef.current;
    if (currentStreak > prev && currentStreak >= 3 && milestones.includes(currentStreak)) {
      setShowStreakCelebration(true);
    }
    streakCelebRef.current = currentStreak;
  }, [currentStreak]);



  const categoryIcons: Record<string, string> = {
    'numerical-ability': '📐',
    'verbal-ability': '📖',
    'analytical-ability': '🧠',
    'general-information': '🇵🇭',
    'clerical-ability': '📁',
  };

  return (
    <div className="dashboard-layout page-wrapper">
      <OfflineBanner />
      <Header
        title="GABAY"
        subtitle="AI Exam Coach"
        rightAction={
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <SWUpdateBadge /><SoundToggle />
            <Button variant="secondary" size="sm" onClick={() => navigate('/help')}>
              👋 Help
            </Button>
          </div>
        }      />

      <main className="dashboard-content">
        {/* SECTION 1: Compact Student Header (15% Max Viewport Height) */}
        <div className="student-compact-header">
          <div className="student-greeting-row">
            <h2>Magandang araw, {profile?.display_name || 'Kapatid'}! 👋</h2>
            <Badge variant={isPremium ? 'gold' : 'teal'}>
              {isPremium ? '⚡ PRO ACCESS' : 'FREE TIER'}
            </Badge>
          </div>

          <div className="dashboard-xp-row">
            <XPBadge
              level={xp.levelInfo.level}
              title={xp.levelInfo.title}
              progress={xp.progress}
              totalXp={xp.totalXp}
              size="lg"
            />
          </div>

          <div className="glanceable-metrics-bar">
            <div className="metric-pill">
              <span className="pill-icon">🔥</span>
              <span className="pill-val">{currentStreak}d Streak</span>
            </div>
            <div className="metric-pill-divider" />
            <div className="metric-pill">
              <span className="pill-icon">⏱️</span>
              <span className="pill-val">{daysToExam !== null ? `${daysToExam}d to Exam` : 'Set Exam Date'}</span>
            </div>
            <div className="metric-pill-divider" />
            <div className="metric-pill">
              <span className="pill-icon">📊</span>
              <span className="pill-val">{readiness && readiness.confidence !== "very_low" ? readiness.score + "%" : "---"}</span>
            </div>
          </div>
        </div>

                {/* SECTION 1.5: Question of the Day */}
        <Card variant="interactive" className="streak-launcher-card" onClick={() => navigate('/streak')}>
              <div className="streak-launcher-content">
                <span className="streak-launcher-icon">🔥</span>
                <div className="streak-launcher-info">
                  <h3>Streak Challenge</h3>
                  <p>Today's daily challenge — how many can you answer correctly?</p>
                </div>
              </div>
            </Card>

{/* SECTION 2: Hero Primary Action Card (Zero Scroll Resumption) */}
        <Card className="hero-resume-card">
          <div className="hero-card-left">
            <span className="hero-badge">🎯 CONTINUE STUDYING</span>
            <h3 className="hero-title">{continueCat.name}</h3>
            <p className="hero-subtitle">
              {attempts && attempts.length > 0
                ? `${attempts.length} questions completed • 1-tap to resume`
                : 'Start your first practice session today'}
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            className="hero-resume-btn"
            onClick={() => navigate(`/study/${continueCat.categoryId}`)}
          >
            Resume Practice →
          </Button>
        </Card>

{readiness && readiness.confidence !== "very_low" && !readinessLoading && (
          <div className="readiness-card-wrapper">
            <div className="card readiness-card">
              <div className="readiness-header">
                <h3>Your Practice Snapshot</h3>
              </div>
              <div className="readiness-score-row">
                <div className="readiness-score-main">
                  <span className="readiness-score-val">{readiness.score}%</span>
                  <span className="readiness-score-ci">&#xb1;{readiness.confidenceInterval}%</span>
                </div>
                <div className="readiness-score-status">
                  <span className="readiness-pass-badge" style={{
                    background: readiness.score >= 80 ? "#22C55E" : "#F97316",
                  }}>
                    {readiness.score >= 80 ? "STRONG" : "GROWING"}
                  </span>
                </div>
              </div>
              <p className="readiness-message">{readiness.message}</p>
              {readiness.weakestCategory && (
                <div className="readiness-focus">
                <div className="readiness-focus">
                  <span>Focus area: <strong>{readiness.weakestCategory}</strong></span>
                </div>
              {readiness.weakestCategory && readiness.categories && (
                <div className="readiness-where-to-focus">
                  <div className="readiness-wtf-header">
                    <span className="readiness-wtf-icon">&#x1F4A1;</span>
                    <span className="readiness-wtf-title">Where to focus</span>
                  </div>
              <details className="readiness-about">
                <summary className="readiness-about-summary">About this score</summary>
                <div className="readiness-about-content">
                  <p>This readiness estimate is calculated from your practice data only. It is not a guarantee or prediction of your official CSE exam result. Scores are based on weighted analysis of your study sessions, mock exams, and short tests using a Bayesian statistical model.</p>
                  <ul>
                    <li>At least 100 weighted practice attempts are needed before an estimate is shown</li>
                    <li>Mock exams carry 3x weight, short tests 2x, and study sessions 1x</li>
                    <li>Your results may vary on exam day based on many factors</li>
                  </ul>
                </div>
              </details>
              <div className="readiness-disclaimer">
                <span>This is an independent practice tool. Not affiliated with the Civil Service Commission.</span>
              </div>
                  <div className="readiness-wtf-categories">
                    {readiness.categories
                      .filter(c => c.weightedTotal >= 5)
                      .sort((a, b) => a.accuracy - b.accuracy)
                      .slice(0, 2)
                      .map(cat => {
                        const pct = Math.round(cat.accuracy * 100);
                        const label = cat.categoryId;
                        return (
                          <div key={cat.categoryId} className="readiness-wtf-row">
                            <div className="readiness-wtf-cat">
                              <span className="readiness-wtf-cat-name">{label}</span>
                              <span className="readiness-wtf-cat-pct">{pct}%</span>
                            </div>
                            <div className="readiness-wtf-rec">
                              {pct < 50
                                ? "Review fundamentals first"
                                : pct < 70
                                  ? "Practice more items"
                                  : "Maintain with review"}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
                </div>
              )}
            </div>
              <details className="readiness-about">
                <summary className="readiness-about-summary">About this score</summary>
                <div className="readiness-about-content">
                  <p>This readiness estimate is calculated from your practice data only. It is not a guarantee or prediction of your official CSE exam result. Scores are based on weighted analysis of your study sessions, mock exams, and short tests using a Bayesian statistical model.</p>
                  <ul>
                    <li>At least 100 weighted practice attempts are needed before an estimate is shown</li>
                    <li>Mock exams carry 3x weight, short tests 2x, and study sessions 1x</li>
                    <li>Your results may vary on exam day based on many factors</li>
                  </ul>
                </div>
              </details>
              <div className="readiness-disclaimer">
                <span>This is an independent practice tool. Not affiliated with the Civil Service Commission.</span>
              </div>
          </div>
        )}
        {readinessLoading && (
          <div className="readiness-card-wrapper">
            <div className="card readiness-card">
              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>Analyzing your practice data...</p>
            </div>
          </div>
        )}


        {/* SECTION 2.5: Mock Exam Launchers (Full + Mini with attempt tracking) */}
        <MockExamLauncher />

        {/* SECTION 3: 4-Subject Quick Launcher Grid */}
        <div className="quick-launcher-section">
          <h3 className="section-heading">📚 Practice Subjects</h3>
          <div className="category-launcher-grid">
            {CATEGORIES.map(cat => (
              <div
                key={cat.id}
                className="category-launcher-card"
                onClick={() => navigate(`/study/${cat.id}`)}
              >
                <div className="cat-card-top">
                  <span className="cat-icon">{cat.icon || categoryIcons[cat.id] || '📝'}</span>
                  <span className="cat-item-count">{getCategoryQuestionCount(cat.id)} items</span>
                </div>
                <h4 className="cat-name">{cat.name}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: Pre-allocated Non-Intrusive Ad Slot */}
        <AdUnit slotId="7447186651" format="fluid" layoutKey="-fb+5w+4e-db+86" minHeight="90px" />

      </main>

            {achievements.newAchievement && (
        <AchievementToast
          achievement={achievements.newAchievement}
          onDismiss={achievements.dismissAchievement}
        />
      )}
      {showStreakCelebration && (
        <StreakCelebration
          streak={currentStreak}
          onDismiss={() => setShowStreakCelebration(false)}
        />
      )}
      <FooterDisclaimer />
      <BottomNav />
    </div>
  );
};

export default Dashboard;




