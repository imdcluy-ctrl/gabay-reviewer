import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './Card';
import { Button } from './Button';
import { useQOTD } from '../hooks/useQOTD';
import './QOTDWidget.css';

export const QOTDWidget: React.FC = () => {
  const navigate = useNavigate();
  const qotd = useQOTD();

  if (qotd.loading) {
    return (
      <Card className="qotd-card">
        <div className="qotd-loading">
          <span className="qotd-shimmer skeleton-shimmer" />
        </div>
      </Card>
    );
  }

  if (qotd.answeredToday) {
    return (
      <Card className="qotd-card qotd-done">
        <div className="qotd-header">
          <span className="qotd-icon">☀️</span>
          <div className="qotd-info">
            <h3 className="qotd-title">Question of the Day</h3>
            <p className="qotd-subtitle">Done for today! ✅</p>
          </div>
        </div>
        <div className="qotd-streak-row">
          <span className="qotd-streak-label">QOTD Streak</span>
          <span className="qotd-streak-val">
            {qotd.streak > 0 ? '🔥 ' + qotd.streak + ' day' + (qotd.streak > 1 ? 's' : '') : 'Start tomorrow!'}
          </span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="qotd-card qotd-active">
      <div className="qotd-header">
        <span className="qotd-icon">☀️</span>
        <div className="qotd-info">
          <h3 className="qotd-title">Question of the Day</h3>
          <p className="qotd-subtitle">
            {qotd.question
              ? 'From ' + qotd.categoryName + ' · +25 XP bonus'
              : 'No questions available'}
          </p>
        </div>
      </div>
      {qotd.question && (
        <Button
          variant="primary"
          size="md"
          fullWidth
          className="qotd-answer-btn"
          onClick={() => {
            navigate('/study/' + qotd.question!.category_id + '?session=qotd&questionId=' + qotd.question!.id);
          }}
        >
          {'Answer QOTD → 🔥 +' + (qotd.streak > 0 ? qotd.streak : 0) + 'd streak'}
        </Button>
      )}
    </Card>
  );
};
