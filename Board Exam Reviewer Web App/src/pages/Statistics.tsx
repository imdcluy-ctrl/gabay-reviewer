import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { useUserProfile } from '../hooks/useUserProfile';
import { useStreak } from '../hooks/useStreak';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ThemeToggle } from '../components/ThemeToggle';
import { BottomNav } from '../components/BottomNav';
import { OfflineBanner } from '../components/OfflineBanner';
import type { StatsWindow } from '../lib/deepAnalytics/types';
import { buildStatisticsModel } from '../lib/deepAnalytics';
import { useUnifiedAnswers } from '../lib/deepAnalytics/hooks/useUnifiedAnswers';
import { StatsFilters } from '../components/statistics/StatsFilters';
import { CategoryRadar } from '../components/statistics/CategoryRadar';
import { SubtopicHeatmap } from '../components/statistics/SubtopicHeatmap';
import { SpeedAccuracyScatter } from '../components/statistics/SpeedAccuracyScatter';
import { StaminaProgressionChart } from '../components/statistics/StaminaProgressionChart';
import { ErrorTagBreakdown } from '../components/statistics/ErrorTagBreakdown';
import { JournalNotesSummary } from '../components/statistics/JournalNotesSummary';
import { StatsEmptyState } from '../components/statistics/StatsEmptyState';
import './Statistics.css';

export const Statistics: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { currentStreak } = useStreak();
  const [windowSelection, setWindowSelection] = useState<StatsWindow>('all_time');

  const userId = profile?.id || 'guest';

  // Single source of truth via shared hook
  const { unifiedAnswers, orphanedCount, isLoading } = useUnifiedAnswers();

  const rawErrorTags = useLiveQuery(
    () => db.error_tags.where('local_user_id').equals(userId).toArray(),
    [userId]
  );

  const analyticsModel = useMemo(() => {
    return buildStatisticsModel({
      answers: unifiedAnswers,
      errorTags: rawErrorTags || [],
      window: windowSelection,
    });
  }, [unifiedAnswers, rawErrorTags, windowSelection]);

  const weakestSubtopic = useMemo(() => {
    return analyticsModel.subtopicMastery.find(s => s.heatBin === 'low');
  }, [analyticsModel.subtopicMastery]);

  const totalAttempted = unifiedAnswers.length;

  const overallAccuracy = useMemo(() => {
    if (totalAttempted === 0) return 0;
    const correctCount = unifiedAnswers.filter(a => a.isCorrect).length;
    return Math.round((correctCount / totalAttempted) * 100);
  }, [unifiedAnswers, totalAttempted]);

  const totalTimeSeconds = useMemo(() => {
    return Math.round(
      unifiedAnswers.reduce((acc, curr) => acc + (curr.timeSpentMs || 0), 0) / 1000
    );
  }, [unifiedAnswers]);

  const formatStudyTime = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m ${totalSecs % 60}s`;
  };

  return (
    <div className="stats-layout">
      <OfflineBanner />
      <Header title="Deep Analytics Hub" subtitle="Cognitive Diagnostics & Performance Insights (§3.3)" />

      <main className="stats-content">
        {orphanedCount > 0 && (
          <div style={{ background: '#fef3c7', color: '#92400e', padding: '8px 12px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.875rem' }}>
            ℹ️ {totalAttempted} records loaded. {orphanedCount} orphaned records skipped.
          </div>
        )}

        {/* Overview Metric Row */}
        <div className="overview-cards-row">
          <Card className="metric-card">
            <span className="metric-icon">📝</span>
            <span className="metric-val">{totalAttempted}</span>
            <span className="metric-label">Questions Attempted</span>
          </Card>

          <Card className="metric-card">
            <span className="metric-icon">🎯</span>
            <span className="metric-val">{overallAccuracy}%</span>
            <span className="metric-label">Overall Accuracy</span>
          </Card>

          <Card className="metric-card">
            <span className="metric-icon">🔥</span>
            <span className="metric-val">{currentStreak}d</span>
            <span className="metric-label">Current Streak</span>
          </Card>

          <Card className="metric-card">
            <span className="metric-icon">⏱</span>
            <span className="metric-val">{formatStudyTime(totalTimeSeconds)}</span>
            <span className="metric-label">Total Study Time</span>
          </Card>
        </div>

        {/* Analytics Window Selector */}
        <StatsFilters
          currentWindow={windowSelection}
          onWindowChange={setWindowSelection}
        />

        {isLoading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>Loading analytics...</div>
        ) : !analyticsModel.hasData ? (
          <StatsEmptyState />
        ) : (
          <>
            {/* 1-Click Priority Remedial Focus Drill */}
            {weakestSubtopic && (
              <Card style={{ background: 'rgba(249, 115, 22, 0.08)', border: '1px solid #F97316' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ color: '#F97316', margin: 0, fontSize: '1rem' }}>🎯 Priority Remedial Focus Needed</h3>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
                      Your lowest accuracy is in <strong>{weakestSubtopic.subtopic.replace('-', ' ')}</strong> ({weakestSubtopic.accuracy}%). Launch a targeted drill to improve.
                    </p>
                  </div>
                  <Button variant="primary" size="md" onClick={() => navigate(`/study/${weakestSubtopic.categoryId}`)}>
                    Start 10-Item Drill →
                  </Button>
                </div>
              </Card>
            )}

            {/* 1. 5-Category Subject Radar vs CSC 80% Cutoff (INV-028f) */}
            <CategoryRadar items={analyticsModel.categoryRadar} />

            {/* 2. Subtopic Mastery Heatmap (INV-028b/c) */}
            <SubtopicHeatmap items={analyticsModel.subtopicMastery} />

            {/* 3. Speed vs Accuracy Diagnostic (INV-028d) */}
            <SpeedAccuracyScatter points={analyticsModel.speedAccuracyScatter} />

            {/* 4. Chronological Stamina Progression (INV-028e) */}
            <StaminaProgressionChart points={analyticsModel.staminaProgression} />

            {/* 5. Error Tag Breakdown (Stage 3.1, INV-026) */}
            <ErrorTagBreakdown items={analyticsModel.errorTagBreakdown} />

            {/* 6. My Study Journal & Reflection Notes Summary */}
            <JournalNotesSummary userId={userId} />
          </>
        )}

        {/* Appearance / Theme Toggle Section */}
        <Card className="stats-section-card">
          <h3>Appearance</h3>
          <p className="section-subtext">Switch between light, dark, or system preference</p>
          <ThemeToggle />
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};

export default Statistics;
