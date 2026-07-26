import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Card } from './Card';
import { Button } from './Button';
import { db } from '../lib/db';
import { useUserProfile } from '../hooks/useUserProfile';
import { useEntitlement } from '../hooks/useEntitlement';
import './MockExamLauncher.css';

export const MockExamLauncher: React.FC = () => {  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { isPremium } = useEntitlement();

  const fullAttempts = useLiveQuery(
    () => profile
      ? db.mock_exam_attempts
          .where('local_user_id').equals(profile.id)
          .filter(a => !a.mock_exam_id.includes('mini'))
          .toArray()
      : [],
    [profile?.id]
  );

  const miniAttempts = useLiveQuery(
    () => profile
      ? db.mock_exam_attempts
          .where('local_user_id').equals(profile.id)
          .filter(a => a.mock_exam_id.includes('mini'))
          .toArray()
      : [],
    [profile?.id]
  );

  const fullAttemptsUsed = fullAttempts?.filter(a => a.status === 'completed').length ?? 0;
  const fullLimit = isPremium ? Infinity : 1;
  const fullExhausted = !isPremium && fullAttemptsUsed >= 1;

  const today = new Date().toLocaleDateString('en-CA');
  const miniToday = miniAttempts?.filter(a => {
    const date = a.started_at?.split('T')[0];
    return date === today && a.status === 'completed';
  }).length ?? 0;
  const miniTotalUsed = miniAttempts?.filter(a => a.status === 'completed').length ?? 0;
  const miniExhausted = !isPremium && (miniTotalUsed >= 3 || miniToday >= 1);

  return (
    <div className="mock-exam-section">
      <h3 className="section-heading">📝 Mock Simulations</h3>

      <Card className={"mock-launcher-card" + (fullExhausted ? " exhausted" : "")}>
        <div className="mock-launcher-header">
          <span className="mock-icon">⏱️</span>
          <div className="mock-launcher-info">
            <h4 className="mock-name">Full CSE Mock Simulation</h4>
            <p className="mock-desc">170 items · 3h 10m · Real exam conditions</p>
          </div>
        </div>
        {!isPremium && (
          <div className="mock-attempts-row">
            <span className="mock-attempt-label">{fullAttemptsUsed} of 1 free attempt used</span>
            {fullExhausted && <span className="mock-upgrade-hint">🔒 Upgrade to Pro for unlimited</span>}
          </div>
        )}
        <div className="mock-btn-row">
          <Button variant={fullExhausted ? "outline" : "primary"} size="md"
            onClick={() => fullExhausted ? navigate('/profile') : navigate('/exam/cse-professional-v1')}>
            {fullExhausted ? "Upgrade to Continue →" : "Professional (170 Items)"}
          </Button>
          <Button variant={fullExhausted ? "outline" : "secondary"} size="md"
            onClick={() => fullExhausted ? navigate('/profile') : navigate('/exam/cse-subprofessional-v1')}>
            {fullExhausted ? "Upgrade for Sub-Pro" : "Sub-Pro (165 Items)"}
          </Button>
        </div>
      </Card>

      <Card className={"mock-launcher-card mini-mock" + (miniExhausted ? " exhausted" : "")}>
        <div className="mock-launcher-header">
          <span className="mock-icon">⚡</span>
          <div className="mock-launcher-info">
            <h4 className="mock-name">Quick Mini Mock</h4>
            <p className="mock-desc">40 items · ~45 min · Perfect for quick practice</p>
          </div>
          <span className="mock-badge-new">NEW</span>
        </div>
        {!isPremium && (
          <div className="mock-attempts-row">
            <span className="mock-attempt-label">
              {miniToday}/1 today · {miniTotalUsed}/3 total
            </span>
            {miniExhausted && <span className="mock-upgrade-hint">🔒 Upgrade for unlimited</span>}
          </div>
        )}
        <Button variant={miniExhausted ? "outline" : "primary"} size="md" fullWidth
          onClick={() => miniExhausted ? navigate('/profile') : navigate('/exam/cse-mini-v1')}>
          {miniExhausted ? "Unlock More →" : "Start Mini Mock (40 Items)"}
        </Button>
      </Card>
    </div>
  );
};
