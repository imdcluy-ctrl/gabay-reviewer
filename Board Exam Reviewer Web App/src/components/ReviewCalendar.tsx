import React, { useMemo } from 'react';
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
    () => profile
      ? db.review_state.where('local_user_id').equals(profile.id).toArray()
      : [],
    [profile?.id]
  );

  const calendarData = useMemo(() => {
    if (!reviewStates || reviewStates.length === 0) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Group due cards by date
    const dateMap: Record<string, { total: number; overdue: boolean }> = {};

    reviewStates.forEach(rs => {
      if (!rs.next_review_date) return;
      const dateStr = rs.next_review_date.split('T')[0]; // YYYY-MM-DD
      if (!dateMap[dateStr]) {
        const reviewDate = new Date(dateStr + 'T00:00:00');
        dateMap[dateStr] = { total: 0, overdue: reviewDate < today };
      }
      dateMap[dateStr].total++;
    });

    return Object.entries(dateMap)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [reviewStates]);

  // Generate weeks for display
  const weeks = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dateMap: Record<string, { count: number; overdue: boolean }> = {};
    calendarData.forEach(d => {
      dateMap[d.date] = { count: d.total, overdue: d.overdue };
    });

    const weeks: (number | null)[][] = [];
    let week: (number | null)[] = [];

    // Fill empty cells before first day
    for (let i = 0; i < firstDay; i++) week.push(null);

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = year + '-' +
        String(month + 1).padStart(2, '0') + '-' +
        String(day).padStart(2, '0');

      week.push(day);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }

    // Fill remaining cells
    while (week.length > 0 && week.length < 7) week.push(null);
    if (week.length > 0) weeks.push(week);

    return weeks;
  }, [calendarData]);

  const monthNames = ['January','February','March','April','May','June',
    'July','August','September','October','November','December'];

  const today = new Date();
  const currentMonth = monthNames[today.getMonth()];
  const totalDue = reviewStates?.filter(rs => {
    if (!rs.next_review_date) return false;
    return new Date(rs.next_review_date) <= today;
  }).length ?? 0;

  return (
    <Card className="review-calendar-card">
      <div className="rc-header">
        <h3 className="rc-title">Spaced Review Calendar</h3>
        <span className="rc-month">{currentMonth}</span>
      </div>

      <div className="rc-total-due">
        {totalDue > 0
          ? totalDue + ' cards due today'
          : 'All caught up!'}
      </div>

      <div className="rc-grid">
        {['S','M','T','W','T','F','S'].map(d => (
          <div key={d} className="rc-day-header">{d}</div>
        ))}

        {weeks.map((week, wi) =>
          week.map((day, di) => {
            if (day === null) return <div key={wi + '-' + di} className="rc-day empty" />;

            const dateStr = today.getFullYear() + '-' +
              String(today.getMonth() + 1).padStart(2, '0') + '-' +
              String(day).padStart(2, '0');

            const data = calendarData.find(d => d.date === dateStr);
            const isToday = day === today.getDate();
            const hasCards = data && data.total > 0;
            const isOverdue = data?.overdue ?? false;

            let className = 'rc-day';
            if (isToday) className += ' today';
            if (hasCards && isOverdue) className += ' overdue';
            else if (hasCards) className += ' has-cards';

            return (
              <div key={wi + '-' + di} className={className}>
                <span className="rc-day-num">{day}</span>
                {hasCards && (
                  <span className="rc-day-count">{data.total}</span>
                )}
              </div>
            );
          })
        )}
      </div>

      {totalDue > 0 && (
        <button className="rc-review-btn" onClick={() => navigate('/review')}>
          Start Review ({totalDue} cards)
        </button>
      )}
    </Card>
  );
};
