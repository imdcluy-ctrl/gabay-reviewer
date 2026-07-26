import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ErrorPatternSummary } from '../components/ErrorPatternSummary';
import { ERROR_TAG_META } from '../lib/errorTags';
import './ErrorPatterns.css';

export const ErrorPatterns: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();

  if (!profile) {
    return (
      <div className="error-patterns-layout page-wrapper">
        <Header title="Error Patterns" showBack onBack={() => navigate(-1)} />
        <main className="ep-content">
          <p>Sign in to see your error patterns.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="error-patterns-layout page-wrapper">
      <Header title="Error Patterns" showBack onBack={() => navigate(-1)} />
      <main className="ep-content">
        <p className="ep-description">
          Understand your mistakes. Each error is tagged with a pattern type to help you identify recurring issues.
        </p>

        <Card className="ep-section">
          <h3>Your Top Error Patterns</h3>
          <ErrorPatternSummary localUserId={profile.id} />
        </Card>

        

        <Card className="ep-section">
          <h3>What Each Pattern Means</h3>
          <div className="ep-patterns-guide">
            {Object.entries(ERROR_TAG_META).map(([key, meta]) => (
              <div key={key} className="ep-pattern-item">
                <span className="ep-pattern-emoji">'❓'</span>
                <div>
                  <strong>{meta.labelEn}</strong>
                  <p>{'No description available'}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/review')}>
          Go to Review Queue
        </Button>
      </main>
    </div>
  );
};
