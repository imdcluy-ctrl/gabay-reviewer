import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { useUserProfile } from '../hooks/useUserProfile';
import { Card } from './Card';
import './ReviewCalendar.css';

export const ReviewCalendar: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();

  const reviewStates = useLiveQuery(
    () => profile ? db.review_state.where('local_user_id').equals(profile.id).toArray() : [],
    [profile?.id]
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const totalDue = (reviewStates || []).filter(rs => {
    if (!rs.next_review_date) return false;
    return new Date(rs.next_review_date) <= today;
  }).length;

  return (
    <Card className="review-calendar-card">
      <div className="rc-header">
        <h3 className="rc-title">Spaced Review</h3>
      </div>
      <div className="rc-total-due">
        {totalDue > 0 ? totalDue + ' cards due today' : 'All caught up!'}
      </div>
      {totalDue > 0 && (
        <button className="rc-review-btn" onClick={() => navigate('/review')}>
          Start Review ({totalDue} cards)
        </button>
      )}
    </Card>
  );
};
