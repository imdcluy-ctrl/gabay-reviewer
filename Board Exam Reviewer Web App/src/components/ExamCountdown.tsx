import React from 'react';
import { Card } from './Card';
import './ExamCountdown.css';

interface ExamCountdownProps {
  examDate: string | null;
}

export const ExamCountdown: React.FC<ExamCountdownProps> = ({ examDate }) => {
  if (!examDate) {
    return (
      <Card className="countdown-card status-none">
        <div className="countdown-icon">📅</div>
        <div className="countdown-info">
          <span className="countdown-title">Set your target exam date</span>
          <span className="countdown-sub">Pace your review schedule effectively</span>
        </div>
      </Card>
    );
  }

  const target = new Date(examDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let statusClass = 'status-calm';
  let message = 'Plenty of time — build your foundation';

  if (daysLeft < 0) {
    statusClass = 'status-past';
    message = 'Your exam date has passed. Update your target in Settings.';
  } else if (daysLeft === 0) {
    statusClass = 'status-today';
    message = "Today is the day. You're ready. 💪";
  } else if (daysLeft < 30) {
    statusClass = 'status-urgent';
    message = "Final stretch — you've got this!";
  } else if (daysLeft <= 60) {
    statusClass = 'status-focus';
    message = 'Time to focus — review daily';
  }

  return (
    <Card className={`countdown-card ${statusClass}`}>
      <div className="countdown-icon">⏳</div>
      <div className="countdown-info">
        <div className="countdown-val-row">
          <span className="countdown-number">{daysLeft >= 0 ? daysLeft : 0}</span>
          <span className="countdown-unit">{daysLeft === 1 ? 'day until exam' : 'days until exam'}</span>
        </div>
        <span className="countdown-message">{message}</span>
      </div>
    </Card>
  );
};
