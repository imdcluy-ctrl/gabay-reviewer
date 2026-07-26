import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { Card } from '../Card';
import { Badge } from '../Badge';
import './JournalNotesSummary.css';

interface JournalNotesSummaryProps {
  userId: string;
}

export const JournalNotesSummary: React.FC<JournalNotesSummaryProps> = ({ userId }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all journal entries for the current user
  const entries = useLiveQuery(
    () => db.journal_entries.where('local_user_id').equals(userId).reverse().sortBy('created_at'),
    [userId]
  ) || [];

  // Fetch corresponding questions
  const questions = useLiveQuery(() => db.questions.toArray()) || [];

  const qMap = new Map(questions.map(q => [q.id, q]));

  const filteredEntries = entries.filter(e => {
    const q = qMap.get(e.question_id);
    const textMatch = (e.note_text || '').toLowerCase().includes(searchTerm.toLowerCase());
    const promptMatch = q ? (q.question_text || '').toLowerCase().includes(searchTerm.toLowerCase()) : false;
    return textMatch || promptMatch;
  });

  return (
    <Card className="journal-summary-card">
      <div className="journal-summary-header">
        <div className="journal-header-left">
          <span className="journal-icon">📓</span>
          <div>
            <h3>My Study Journal Notes ({entries.length})</h3>
            <p className="journal-sub">Your personal reflections, mnemonics, and notes on practice questions.</p>
          </div>
        </div>
      </div>

      {entries.length > 0 && (
        <div className="journal-search-box">
          <input
            type="text"
            placeholder="Search notes or question key terms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="journal-search-input"
          />
        </div>
      )}

      {entries.length === 0 ? (
        <div className="journal-empty-state">
          <span className="empty-icon">📝</span>
          <p>You haven't saved any journal notes yet.</p>

        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="journal-empty-state">
          <p>No notes matched your search term "{searchTerm}".</p>
        </div>
      ) : (
        <div className="journal-entries-list">
          {filteredEntries.map(e => {
            const q = qMap.get(e.question_id);
            const dateStr = new Date(e.created_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div key={e.id} className="journal-item-card">
                <div className="journal-item-top">
                  <Badge variant="teal">{q?.blueprint_id || e.question_id}</Badge>
                  <span className="journal-item-date">{dateStr}</span>
                </div>
                {q && <p className="journal-item-prompt">❓ {q.question_text}</p>}
                <div className="journal-item-note">
                  <span className="note-quote-icon">💬</span>
                  <p className="note-text">{e.note_text}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
