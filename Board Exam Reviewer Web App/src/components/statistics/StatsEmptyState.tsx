import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../Button';
import './StatsEmptyState.css';

export const StatsEmptyState: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="stats-empty-card">
      <div className="empty-icon">📊</div>
      <h3 className="empty-title">No Exam Analytics Available Yet</h3>
      <p className="empty-description">
        Complete your first Mock Exam or Study Session to unlock deep subtopic heatmaps, speed diagnostics, and stamina tracking.
      </p>
      <div className="empty-actions">
        <Button variant="primary" size="lg" onClick={() => navigate('/dashboard')}>
          🎯 Take Full Simulation Exam
        </Button>
        <Button variant="secondary" size="md" onClick={() => navigate('/categories')}>
          📚 Practice Daily Study Loop
        </Button>
      </div>
    </div>
  );
};
