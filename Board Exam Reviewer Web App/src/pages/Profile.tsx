import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { useUserProfile } from '../hooks/useUserProfile';
import { useStreak } from '../hooks/useStreak';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { BottomNav } from '../components/BottomNav';
import { OfflineBanner } from '../components/OfflineBanner';
import { PaywallBanner } from '../components/paywall/PaywallBanner';
import { useEntitlement } from '../hooks/useEntitlement';
import { useAchievements } from '../hooks/useAchievements';
import { useXP } from '../hooks/useXP';
import { XPBadge } from '../components/XPBadge';
import { SoundToggle } from '../components/SoundToggle';
import './Profile.css';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { currentStreak } = useStreak();
  const xp = useXP();
  const achievements = useAchievements();

  const { isPremium } = useEntitlement();

  const attempts = useLiveQuery(() =>
    profile ? db.attempts.where('local_user_id').equals(profile.id).toArray() : []
  , [profile?.id]);

  const totalAttempted = attempts ? attempts.length : 0;
  const accuracy =
    attempts && attempts.length > 0
      ? Math.round((attempts.filter(a => a.is_correct).length / attempts.length) * 100)
      : 0;

  const isGuest = !profile?.auth_user_id;
  const initialLetter = (profile?.display_name || 'G')[0]?.toUpperCase() || 'G';

  return (
    <div className="profile-layout page-wrapper">
      <OfflineBanner />
      <Header title="Profile" rightAction={<SoundToggle />} />

      <main className="profile-content">
        {/* User Identity Card */}
        <Card className="profile-user-card">
          <div className="avatar-circle">{initialLetter}</div>
          <div className="user-details">
            <h2 className="user-name">{profile?.display_name || 'Kapatid'}</h2>
            <Badge variant={isGuest ? 'gold' : 'correct'}>
              {isGuest ? '📱 Guest Mode' : '✓ Verified Account'}
            </Badge>
          </div>
        </Card>


        {/* XP Level Card */}
        <XPBadge
          level={xp.levelInfo.level}
          title={xp.levelInfo.title}
          progress={xp.progress}
          totalXp={xp.totalXp}
          size="lg"
        />
        {/* Quick Stats Summary */}
        <div className="profile-stats-grid">
          <Card className="profile-stat-box">
            <span className="pstat-val">{totalAttempted}</span>
            <span className="pstat-lbl">Questions</span>
          </Card>
          <Card className="profile-stat-box">
            <span className="pstat-val">{accuracy}%</span>
            <span className="pstat-lbl">Accuracy</span>
          </Card>
          <Card className="profile-stat-box">
            <span className="pstat-val">{currentStreak}d</span>
            <span className="pstat-lbl">Streak</span>
          </Card>
        </div>

        {/* Pro Upgrade Section */}
        {!isPremium && (
          <Card className="pro-upgrade-card">
            <div className="pro-upgrade-header">
              <span className="pro-icon">{'🔒'}</span>
              <div>
                <h3>Upgrade to Gabay Pro</h3>
                <p>Unlock full CSE exam preparation</p>
              </div>
            </div>

            <div className="pro-features-grid">
              <div className="pro-feature">
                <span className="pro-check">{'✅'}</span>
                <div>
                  <strong>Unlimited Mock Exams</strong>
                  <p>Full 170-item and Mini 40-item sims</p>
                </div>
              </div>
              <div className="pro-feature">
                <span className="pro-check">{'✅'}</span>
                <div>
                  <strong>Unlimited Mini Mocks</strong>
                  <p>Quick 40-item practice, any time</p>
                </div>
              </div>
              <div className="pro-feature">
                <span className="pro-check">{'✅'}</span>
                <div>
                  <strong>AI Tutor Walkthroughs</strong>
                  <p>Step-by-step solution explanations</p>
                </div>
              </div>
              <div className="pro-feature">
                <span className="pro-check">{'✅'}</span>
                <div>
                  <strong>Full Question Bank</strong>
                  <p>2,910+ questions, all categories</p>
                </div>
              </div>
              <div className="pro-feature">
                <span className="pro-check">{'✅'}</span>
                <div>
                  <strong>Priority Review Queue</strong>
                  <p>Spaced repetition for all items</p>
                </div>
              </div>
              <div className="pro-feature">
                <span className="pro-check">{'✅'}</span>
                <div>
                  <strong>Advanced Analytics</strong>
                  <p>Predictive scores, error patterns, heatmaps</p>
                </div>
              </div>
            </div>

            <PaywallBanner onSuccess={() => navigate('/checkout/success')} />
          </Card>
        )}

        {/* Navigation Actions List */}
        <div className="profile-menu-list">
          <Card
            variant="interactive"
            className="menu-item-card"
            onClick={() => navigate('/profile/stats')}
          >
            <div className="menu-item-left">
              <span className="menu-icon">📊</span>
              <div className="menu-text">
                <h4>Detailed Statistics</h4>
                <p>Category breakdowns & recent activity</p>
              </div>
            </div>
            <span className="menu-arrow">→</span>
          </Card>

          <Card
            variant="interactive"
            className="menu-item-card"
            onClick={() => navigate('/achievements')}
          >
            <div className="menu-item-left">
              <span className="menu-icon">??</span>
              <div className="menu-text">
                <h4>Achievements <span className="menu-badge">{achievements.progress}/{achievements.total}</span></h4>
                <p>Track your badges and progress</p>
              </div>
            </div>
            <span className="menu-arrow">?</span>
          </Card>

          <Card
            variant="interactive"
            className="menu-item-card"
            onClick={() => navigate('/settings')}
          >
            <div className="menu-item-left">
              <span className="menu-icon">⚙️</span>
              <div className="menu-text">
                <h4>Settings & Preferences</h4>
                <p>Exam dates, dark mode, & notifications</p>
              </div>
            </div>
            <span className="menu-arrow">→</span>
          </Card>

          {isGuest && (
            <Card
              variant="interactive"
              className="menu-item-card create-acc-card"
              onClick={() => navigate('/auth')}
            >
              <div className="menu-item-left">
                <span className="menu-icon">🔐</span>
                <div className="menu-text">
                  <h4>Create Free Account</h4>
                  <p>Back up your progress to the cloud</p>
                </div>
              </div>
              <span className="menu-arrow">→</span>
            </Card>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};




