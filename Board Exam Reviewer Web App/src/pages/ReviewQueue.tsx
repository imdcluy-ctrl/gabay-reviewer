import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import { getReviewQueueSummary } from '../lib/questionSelection';
import type { ReviewQueueSummary } from '../lib/questionSelection';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { BottomNav } from '../components/BottomNav';
import { OfflineBanner } from '../components/OfflineBanner';
import './ReviewQueue.css';

export const ReviewQueue: React.FC = () => {
  const navigate = useNavigate();
  const { profile, isLoading } = useUserProfile();

  const [summary, setSummary] = useState<ReviewQueueSummary | null>(null);

  useEffect(() => {
    async function loadSummary() {
      if (profile) {
        const s = await getReviewQueueSummary(profile.id);
        setSummary(s);
      }
    }
    loadSummary();
  }, [profile]);

  if (isLoading || !summary) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Review Queue...</div>;
  }

  const {
    trueDueCount,
    cappedSessionCount,
    masteredCount,
    boxCounts,
    estimatedMinutes,
    hasLeeches,
    isCapped,
  } = summary;

  const handleStartReview = () => {
    navigate('/study/all?session=review');
  };

  return (
    <div className="review-queue-layout">
      <OfflineBanner />
      <Header title="Spaced Review" subtitle="Adaptively retained memory queue" />

      <main className="review-queue-content">
        {/* Daily Overview Bar */}
        <Card className="review-overview-card">
          <div className="overview-stat">
            <span className="stat-val due-val">{trueDueCount}</span>
            <span className="stat-lbl">Due Today</span>
          </div>
          <div className="overview-stat">
            <span className="stat-val mastered-val">{masteredCount}</span>
            <span className="stat-lbl">Mastered (Box 5)</span>
          </div>
          <div className="overview-stat">
            <span className="stat-val time-val">~{estimatedMinutes}m</span>
            <span className="stat-lbl">Est. Time</span>
          </div>
        </Card>

        {/* Leech or Cap Banners */}
        {hasLeeches && (
          <div className="leech-alert-banner">
            ⚠️ <strong>Overconfidence Leech Alert:</strong> You have priority leech cards due. Full worked solutions will be displayed first.
          </div>
        )}

        {isCapped && (
          <div className="overflow-info-banner">
            ℹ️ Showing first 20 due cards — {trueDueCount - 20} remaining cards will roll over to your next sessions.
          </div>
        )}

        {/* Action Button or Empty State */}
        {trueDueCount > 0 ? (
          <Card className="launch-review-card">
            <h3>Ready for your daily review?</h3>
            <p>
              Reviewing {cappedSessionCount} items today keeps your recall strong before exam day.
            </p>
            <Button variant="primary" size="lg" fullWidth onClick={handleStartReview}>
              Review {cappedSessionCount} Cards Due Today →
            </Button>
          </Card>
        ) : (
          <Card className="empty-review-card">
            <span className="celebrate-icon">🎉</span>
            <h2>All caught up for today, Kapatid!</h2>
            <p>You've completed all your due spaced repetition reviews. Keep your streak going with practice!</p>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate('/study')}
            >
              Start Category Practice →
            </Button>
          </Card>
        )}

        {/* Visual Box Stacks */}
        <div className="box-stacks-section">
          <h3>Leitner Memory Stacks</h3>
          <div className="box-stacks-grid">
            <Card className="box-stack-card box-1">
              <div className="box-header">
                <span className="box-icon">📕</span>
                <span className="box-title">Box 1: Learning</span>
              </div>
              <span className="box-count">{boxCounts[1] || 0} cards</span>
            </Card>

            <Card className="box-stack-card box-2">
              <div className="box-header">
                <span className="box-icon">📘</span>
                <span className="box-title">Box 2: Familiar</span>
              </div>
              <span className="box-count">{boxCounts[2] || 0} cards</span>
            </Card>

            <Card className="box-stack-card box-3">
              <div className="box-header">
                <span className="box-icon">📙</span>
                <span className="box-title">Box 3: Building</span>
              </div>
              <span className="box-count">{boxCounts[3] || 0} cards</span>
            </Card>

            <Card className="box-stack-card box-4">
              <div className="box-header">
                <span className="box-icon">📗</span>
                <span className="box-title">Box 4: Strong</span>
              </div>
              <span className="box-count">{boxCounts[4] || 0} cards</span>
            </Card>

            <Card className="box-stack-card box-5">
              <div className="box-header">
                <span className="box-icon">📒</span>
                <span className="box-title">Box 5: Mastered</span>
              </div>
              <span className="box-count">{boxCounts[5] || 0} cards</span>
            </Card>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};
