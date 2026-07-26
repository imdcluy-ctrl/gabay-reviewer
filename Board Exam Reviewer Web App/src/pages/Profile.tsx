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
import { SoundToggle } from '../components/SoundToggle';
import './Profile.css';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { currentStreak } = useStreak();
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

        {/* Subtle Paywall Upgrade Banner */}
        {!isPremium && (
          <PaywallBanner onSuccess={() => navigate('/checkout/success')} />
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




