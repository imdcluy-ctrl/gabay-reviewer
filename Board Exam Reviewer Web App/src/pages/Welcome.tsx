import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import './Welcome.css';

export const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <div className="welcome-header">
          <h1 className="welcome-logo">GABAY</h1>
          <p className="welcome-tagline">Your AI Exam Coach</p>
        </div>

        <div className="stat-pills">
          <div className="stat-pill pill-1">
            <span className="pill-icon">📊</span>
            <span>331,000+ examinees every cycle</span>
          </div>
          <div className="stat-pill pill-2">
            <span className="pill-icon">🎯</span>
            <span>10-12% pass rate</span>
          </div>
          <div className="stat-pill pill-3">
            <span className="pill-icon">✨</span>
            <span>You can beat the odds</span>
          </div>
        </div>

        <div className="legal-disclaimer-box" style={{ background: 'rgba(13, 115, 119, 0.08)', borderLeft: '4px solid var(--color-brand-teal)', padding: '12px 16px', borderRadius: '8px', margin: '16px 0', textAlign: 'left', fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--color-brand-teal)', display: 'block', marginBottom: '4px' }}>ℹ️ Independent Exam Preparation Tool</strong>
          Gabay Reviewer is an independent, unofficial self-assessment platform and is <strong>not affiliated with, endorsed by, or sponsored by the Civil Service Commission (CSC)</strong> or any Philippine government agency. Gabay helps examinees prepare for the CSE-PPT through timed practice, weak-topic diagnostics, and guided hints to reduce test anxiety and build exam stamina. Gabay does not guarantee passing the official CSC exam — actual results depend on individual study habits and mastery.
        </div>

        <div className="welcome-cta-container">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate('/onboarding')}
          >
            Start Free Review →
          </Button>
          <p className="welcome-footnote">No account needed · 100% free to start</p>
          <div className="welcome-legal-links">
            <span onClick={() => navigate('/terms')}>Terms</span>
            <span>·</span>
            <span onClick={() => navigate('/privacy')}>Privacy</span>
          </div>
        </div>
      </div>
    </div>
  );
};
