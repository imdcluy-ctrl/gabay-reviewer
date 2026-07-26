import React from 'react';
import { Card } from '../Card';
import './DashboardStats.css';

interface DashboardStatsProps {
  totalQuestions: number;
  totalAttempts: number;
  flaggedCount: number;
  overallFailRate: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalQuestions,
  totalAttempts,
  flaggedCount,
  overallFailRate,
}) => {
  return (
    <div className="admin-stats-grid">
      <Card className="admin-stat-card">
        <span className="stat-icon">📚</span>
        <div className="stat-info">
          <span className="stat-value">{totalQuestions}</span>
          <span className="stat-label">Total Questions in Bank</span>
        </div>
      </Card>

      <Card className="admin-stat-card">
        <span className="stat-icon">📝</span>
        <div className="stat-info">
          <span className="stat-value">{totalAttempts}</span>
          <span className="stat-label">Total Attempts</span>
        </div>
      </Card>

      <Card className="admin-stat-card highlight-danger">
        <span className="stat-icon">⚠️</span>
        <div className="stat-info">
          <span className="stat-value">{flaggedCount}</span>
          <span className="stat-label">Flagged Questions</span>
        </div>
      </Card>

      <Card className="admin-stat-card">
        <span className="stat-icon">📊</span>
        <div className="stat-info">
          <span className="stat-value">{Math.round(overallFailRate * 100)}%</span>
          <span className="stat-label">Overall Failure Rate</span>
        </div>
      </Card>
    </div>
  );
};
