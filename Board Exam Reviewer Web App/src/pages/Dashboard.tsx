import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { CATEGORIES } from '../lib/constants';
import { useUserProfile } from '../hooks/useUserProfile';
import { useStreak } from '../hooks/useStreak';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { BottomNav } from '../components/BottomNav';
import { OfflineBanner } from '../components/OfflineBanner';
import { SoundToggle } from '../components/SoundToggle';
import { QOTDWidget } from '../components/QOTDWidget';
import { useAchievements } from '../hooks/useAchievements';
import { AchievementToast } from '../components/AchievementToast';
import { useSound } from '../hooks/useSound';
import { StreakCelebration } from '../components/StreakCelebration';
import { PredictiveScoreCard } from '../components/PredictiveScoreCard';
import { MockExamLauncher } from '../components/MockExamLauncher';
import { MasteryHeatmap } from '../components/MasteryHeatmap';
import { ReviewCalendar } from '../components/ReviewCalendar';
import { StudyPlanner } from '../components/StudyPlanner';
import { calculatePredictiveScore } from '../lib/predictiveScore';
import { useXP } from '../hooks/useXP';
import { XPBadge } from '../components/XPBadge';
import { ErrorPatternSummary } from '../components/ErrorPatternSummary';
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

  const [showErrorInsights, setShowErrorInsights] = useState(false);

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
  const READINESS_PRIOR_WEIGHT = 30;  // Conservative prior weight
  const READINESS_PRIOR_RATE = 0.50;  // Assume 50% prior (no knowledge)

  const readinessPct = React.useMemo(() => {
    if (!attempts || attempts.length === 0) return 0;

    // Bayesian-adjusted overall accuracy
    const totalCorrect = attempts.filter(a => a.is_correct).length;
    const totalAnswered = attempts.length;
    const bayesianEstimate =
      (totalCorrect + READINESS_PRIOR_WEIGHT * READINESS_PRIOR_RATE) /
      (totalAnswered + READINESS_PRIOR_WEIGHT);

    // Category coverage bonus: up to +10% for attempting all 4 categories
    const categoriesCovered = new Set(
      attempts
        .map(a => a.question_id)
        .map(qId => questions.find(q => q.id === qId)?.category_id)
        .filter(Boolean)
    ).size;
    const totalCategories = 4; // numerical, verbal, analytical, clerical
    const coverageBonus = Math.min(categoriesCovered / totalCategories, 1) * 0.10;

    // Difficulty bonus: harder questions contribute more
    const avgDifficulty = attempts.reduce((sum, a) => {
      const q = questions.find(q => q.id === a.question_id);
      return sum + (q?.difficulty || 1);
    }, 0) / Math.max(totalAnswered, 1);
    const difficultyBonus = Math.max(0, (avgDifficulty - 1) / 2) * 0.05;

    // Combine: base + coverage + difficulty, capped at 0-100%
    const rawScore = bayesianEstimate + coverageBonus + difficultyBonus;
    return Math.min(100, Math.max(0, Math.round(rawScore * 100)));
  }, [attempts, questions]);
  // Predictive CSE Score
  const predictiveResult = React.useMemo(() => {
    if (!attempts || !questions) return null;
    const questionCategoryMap: Record<string, string> = {};
    questions.forEach(q => { questionCategoryMap[q.id] = q.category_id; });
    return calculatePredictiveScore(
      attempts,
      questionCategoryMap,
      currentStreak,
      daysToExam,
      questions.length,
    );
  }, [attempts, questions, currentStreak, daysToExam]);


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
            <SoundToggle />
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
              <span className="pill-val">{readinessPct}% Readiness</span>
            </div>
          </div>
        </div>

                {/* SECTION 1.5: Question of the Day */}
        <QOTDWidget />

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

        {/* SECTION 2.25: Predictive Score Card */}
        {predictiveResult && predictiveResult.trend !== "insufficient_data" && (
          <PredictiveScoreCard result={predictiveResult} />
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

                {/* SECTION 4.1: Smart Study Planner */}
        <StudyPlanner />

        {/* SECTION 4.25: Spaced Review Calendar */}
        <ReviewCalendar />

        {/* SECTION 4.5: Mastery Heatmap */}
        {profile?.id && (
          <div className="quick-launcher-section">
            <h3 className="section-heading">Mastery Map</h3>
            <MasteryHeatmap compact />
          </div>
        )}

{/* SECTION 5: Collapsible Metacognitive Error Insights Drawer */}
        {profile?.id && (
          <div className="insights-drawer-wrapper">
            <button
              className="insights-drawer-toggle"
              onClick={() => setShowErrorInsights(!showErrorInsights)}
            >
              <span>🧠 Metacognitive Error Patterns</span>
              <span className="drawer-icon">{showErrorInsights ? '▲ Hide' : '▼ View'}</span>
            </button>
            {showErrorInsights && (
              <div className="insights-drawer-content">
                <ErrorPatternSummary localUserId={profile.id} />
              </div>
            )}
          </div>
        )}
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




