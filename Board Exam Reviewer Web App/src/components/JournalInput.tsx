import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { useUserProfile } from '../hooks/useUserProfile';
import { Button } from './Button';
import './JournalInput.css';

interface JournalInputProps {
  questionId: string;
  onNextQuestion: (noteText: string, promptUsed: string) => void;
}

const ROTATING_PROMPTS = [
  'What will you remember next time?',
  'Why did you pick that answer?',
  'What tripped you up?',
  "In your own words, what's the key lesson here?",
];

export const JournalInput: React.FC<JournalInputProps> = ({
  questionId,
  onNextQuestion,
}) => {
  const { profile } = useUserProfile();
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  const [noteText, setNoteText] = useState<string>('');

  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * ROTATING_PROMPTS.length);
    setSelectedPrompt(ROTATING_PROMPTS[randomIdx] || '');
  }, [questionId]);

  const previousNotes = useLiveQuery(async () => {
    if (!profile) return [];
    return await db.journal_entries
      .where('local_user_id')
      .equals(profile.id)
      .filter(entry => entry.question_id === questionId)
      .reverse()
      .toArray();
  }, [profile, questionId]);

  const handleSubmit = () => {
    onNextQuestion(noteText.trim(), selectedPrompt);
  };

  return (
    <div className="journal-input-section">
      <div className="journal-header">
        <span className="journal-icon">📝</span>
        <h4 className="journal-title">Learning Journal (Optional)</h4>
      </div>

      {previousNotes && previousNotes.length > 0 && (
        <div className="previous-notes-box">
          <span className="prev-notes-label">Your previous notes for this question:</span>
          {previousNotes.map(entry => (
            <div key={entry.id} className="prev-note-item">
              <p className="prev-note-text">"{entry.note_text}"</p>
              <span className="prev-note-date">
                {new Date(entry.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="journal-form">
        <label htmlFor="journal-textarea" className="journal-prompt-label">
          {selectedPrompt}
        </label>
        <textarea
          id="journal-textarea"
          className="journal-textarea"
          rows={3}
          placeholder="Type your reflection here..."
          value={noteText}
          onChange={e => setNoteText(e.target.value)}
        />
        <Button variant="primary" size="lg" fullWidth onClick={handleSubmit}>
          Next Question →
        </Button>
      </div>
    </div>
  );
};
