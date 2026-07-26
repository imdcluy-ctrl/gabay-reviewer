import React, { useState, useEffect } from 'react';
import { ERROR_TAG_META, type ErrorTagId } from '../lib/errorTags';
import { getErrorTagForMock, upsertErrorTag, clearErrorTag } from '../lib/errorTagRepository';
import './ErrorTagSelector.css';

interface ErrorTagSelectorProps {
  localUserId: string;
  questionId: string;
  isIncorrect: boolean;
  attemptId?: string;
  source?: 'mock_exam' | 'practice' | 'sr_review';
  sourceSessionId?: string;
  timeSpentSeconds?: number;
  machineErrorClass?: string;
  disabled?: boolean;
  onTagged?: (tag: ErrorTagId | null) => void;
}

export const ErrorTagSelector: React.FC<ErrorTagSelectorProps> = ({
  localUserId,
  questionId,
  isIncorrect,
  attemptId,
  source = 'mock_exam',
  sourceSessionId,
  disabled = false,
  onTagged,
}) => {
  const [selectedTag, setSelectedTag] = useState<ErrorTagId | null>(null);
  const [note, setNote] = useState<string>('');
  const [showNoteInput, setShowNoteInput] = useState<boolean>(false);
  const [activeInfoTag, setActiveInfoTag] = useState<ErrorTagId | null>(null);

  useEffect(() => {
    if (!isIncorrect) return;

    let isMounted = true;
    async function loadExistingTag() {
      if (attemptId && source === 'mock_exam') {
        const existing = await getErrorTagForMock(attemptId, questionId);
        if (isMounted && existing) {
          setSelectedTag(existing.tag);
          setNote(existing.note || '');
          if (existing.note) setShowNoteInput(true);
        }
      }
    }

    loadExistingTag();
    return () => {
      isMounted = false;
    };
  }, [attemptId, questionId, isIncorrect, source]);

  if (!isIncorrect) {
    return null; // INV-026a: Scope: Render only when incorrect
  }

  const handleSelectTag = async (tagId: ErrorTagId) => {
    if (disabled) return;

    if (selectedTag === tagId) {
      // Toggle off / clear tag (INV-026e)
      setSelectedTag(null);
      if (attemptId) {
        await clearErrorTag(attemptId, questionId);
      }
      onTagged?.(null);
    } else {
      // Upsert tag
      setSelectedTag(tagId);
      await upsertErrorTag({
        localUserId,
        attemptId,
        questionId,
        tag: tagId,
        note,
        source,
        sourceSessionId,
      });
      onTagged?.(tagId);
    }
  };

  const handleNoteChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNote(val);

    if (selectedTag) {
      await upsertErrorTag({
        localUserId,
        attemptId,
        questionId,
        tag: selectedTag,
        note: val,
        source,
        sourceSessionId,
      });
    }
  };

  const tags = Object.values(ERROR_TAG_META);

  return (
    <div className="error-tag-selector-card">
      <div className="error-tag-header">
        <div>
          <h4 className="error-tag-title">
            Why did you miss this? <span className="title-sub">(Bakit mo ito napagkamalan?)</span>
          </h4>
          <p className="error-tag-subtitle">
            Tagging your mistake type builds self-awareness for exam day.
          </p>
        </div>
      </div>

      <div className="error-tag-chips" role="radiogroup" aria-label="Error Tag Selection">
        {tags.map(meta => {
          const isSelected = selectedTag === meta.id;
          return (
            <div key={meta.id} className="error-tag-chip-wrapper">
              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={disabled}
                onClick={() => handleSelectTag(meta.id)}
                className={`error-tag-chip ${isSelected ? 'selected' : ''}`}
                style={{
                  '--chip-color': meta.colorToken,
                } as React.CSSProperties}
              >
                <span className="chip-indicator">{isSelected ? '✓' : '○'}</span>
                <span className="chip-label">{meta.labelEn}</span>
                <button
                  type="button"
                  className="info-btn"
                  title="Explain this tag"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveInfoTag(activeInfoTag === meta.id ? null : meta.id);
                  }}
                >
                  ℹ
                </button>
              </button>

              {activeInfoTag === meta.id && (
                <div className="tag-info-popover">
                  <p className="info-text"><strong>{meta.labelEn}</strong> ({meta.labelTl})</p>
                  <p className="info-desc">{meta.helperText}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!showNoteInput && selectedTag && (
        <button
          type="button"
          className="add-note-btn"
          onClick={() => setShowNoteInput(true)}
        >
          + Add personal note (optional)
        </button>
      )}

      {showNoteInput && (
        <div className="tag-note-wrapper">
          <textarea
            className="tag-note-input"
            placeholder="What will you do differently next time? (max 280 chars)"
            maxLength={280}
            value={note}
            onChange={handleNoteChange}
            disabled={disabled}
          />
          <div className="note-char-count">{note.length}/280</div>
        </div>
      )}
    </div>
  );
};
