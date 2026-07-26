import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../lib/db';
import { useUserProfile } from '../hooks/useUserProfile';
import { signOutUser } from '../lib/auth';
import { EXAM_LEVELS } from '../lib/constants';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ThemeToggle } from '../components/ThemeToggle';
import { OfflineBanner } from '../components/OfflineBanner';
import './Settings.css';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();

  const [examLevel, setExamLevel] = useState<string>(profile?.exam_level || 'professional');
  const [examDate, setExamDate] = useState<string>(profile?.exam_date || '');
  const [reminderTime, setReminderTime] = useState<string>(() => {
    return localStorage.getItem('gabay_reminder_time') || '19:00';
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSaveExamSettings = async () => {
    if (!profile) return;
    await db.user_profile.update(profile.id, {
      exam_level: examLevel,
      exam_target: `cse-${examLevel}`,
      exam_date: examDate || null,
    });
    showToast('Exam settings saved! ✓');
  };

  const handleSetReminder = async () => {
    localStorage.setItem('gabay_reminder_time', reminderTime);
    if ('Notification' in window && Notification.permission !== 'granted') {
      await Notification.requestPermission();
    }

    // Compute real due count at reminder setting time (§9)
    const nowIso = new Date().toISOString();
    const dueCount = profile
      ? await db.review_state
          .where('local_user_id')
          .equals(profile.id)
          .filter(rs => rs.next_review_date <= nowIso)
          .count()
      : 0;

    if (dueCount > 0) {
      showToast(`Reminder set for ${reminderTime}! You have ${dueCount} cards due. 🔔`);
    } else {
      showToast(`Reminder set for ${reminderTime}! All caught up — keep your streak with practice! 🔔`);
    }
  };

  const handleLogOut = async () => {
    await signOutUser();
    if (profile) {
      await db.user_profile.update(profile.id, { auth_user_id: null });
    }
    showToast('Logged out successfully.');
    setTimeout(() => navigate('/dashboard'), 1000);
  };

  const handleClearData = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear all your study data? This cannot be undone.'
    );
    if (confirmed && profile) {
      await db.attempts.clear();
      await db.journal_entries.clear();
      await db.review_state.clear();
      await db.user_profile.update(profile.id, { onboarding_completed: false });
      showToast('All study data cleared. Resetting...');
      setTimeout(() => navigate('/onboarding'), 1200);
    }
  };

  const isGuest = !profile?.auth_user_id;

  return (
    <div className="settings-layout">
      <OfflineBanner />
      <Header title="Settings" showBack onBack={() => navigate(-1)} />

      <main className="settings-content">
        {/* 1. Account Section */}
        <Card className="settings-section">
          <h3>Account</h3>
          {isGuest ? (
            <div className="settings-row-col">
              <p className="settings-subtext">You are using Gabay as a guest on this device.</p>
              <Button variant="primary" size="md" onClick={() => navigate('/auth')}>
                Create Account / Log In
              </Button>
            </div>
          ) : (
            <div className="settings-row-col">
              <p className="settings-subtext">Logged in as account user ({profile?.email || 'Admin'})</p>
              <Button variant="secondary" size="md" onClick={handleLogOut}>
                Log Out
              </Button>
            </div>
          )}
        </Card>

        {/* 2. Exam Settings */}
        <Card className="settings-section">
          <h3>Exam Target</h3>
          <div className="form-group">
            <label>Exam Level</label>
            <select
              className="settings-select"
              value={examLevel}
              onChange={e => setExamLevel(e.target.value)}
            >
              {Object.values(EXAM_LEVELS).map(lvl => (
                <option key={lvl.id} value={lvl.id}>
                  {lvl.name} ({lvl.items} items)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Target Exam Date</label>
            <input
              type="date"
              className="settings-input"
              value={examDate}
              onChange={e => setExamDate(e.target.value)}
            />
          </div>

          <Button variant="primary" size="md" onClick={handleSaveExamSettings}>
            Save Exam Target
          </Button>
        </Card>

        {/* 3. Appearance */}
        <Card className="settings-section">
          <h3>Appearance</h3>
          <ThemeToggle />
        </Card>

        {/* 4. Study Reminders */}
        <Card className="settings-section">
          <h3>Daily Study Reminder</h3>
          <p className="settings-subtext">Set a daily time to get notified for practice</p>
          <div className="reminder-time-row">
            <input
              type="time"
              className="settings-input"
              value={reminderTime}
              onChange={e => setReminderTime(e.target.value)}
            />
            <Button variant="secondary" size="md" onClick={handleSetReminder}>
              Set Reminder
            </Button>
          </div>
        </Card>

        {/* 5. About */}
        <Card className="settings-section">
          <h3>About Gabay</h3>
          <p className="version-text">Gabay v0.1.0 (Phase 1a)</p>
          <p className="ph-flag-text">Made with ❤️ for Filipino Civil Servants 🇵🇭</p>
          <div className="legal-links-row">
            <Link to="/privacy">Privacy Policy</Link> · <Link to="/terms">Terms of Service</Link>
          </div>
        </Card>

        {/* 6. Data Management */}
        <Card className="settings-section danger-zone">
          <h3>Data Management</h3>
          <p className="danger-text">Clearing your data will erase all local attempts and notes.</p>
          <Button variant="outline" size="md" className="danger-btn" onClick={handleClearData}>
            Clear All Study Data
          </Button>
        </Card>
      </main>

      {toastMsg && <div className="settings-toast">{toastMsg}</div>}
    </div>
  );
};
