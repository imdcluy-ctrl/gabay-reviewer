import React, { useState, useEffect } from 'react';
import type { WorryDumpRecord } from '../../lib/db';
import { saveWorryDump, listWorryDumps, deleteWorryDump } from '../../lib/anxietyStorage';
import './WorryDump.css';

interface WorryDumpProps {
  localUserId: string;
}

const WORRY_PROMPTS = [
  'What if I run out of time during Numerical Ability?',
  'I am afraid I will forget key vocabulary rules.',
  'What if the testing center room is too noisy?',
  'I feel nervous about failing again.',
];

export const WorryDump: React.FC<WorryDumpProps> = ({ localUserId }) => {
  const [text, setText] = useState<string>('');
  const [dumps, setDumps] = useState<WorryDumpRecord[]>([]);
  const [deleteIdConfirm, setDeleteIdConfirm] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadHistory() {
      if (!localUserId) return;
      const history = await listWorryDumps(localUserId);
      if (isMounted) setDumps(history);
    }

    loadHistory();
    return () => {
      isMounted = false;
    };
  }, [localUserId]);

  const handleSave = async () => {
    if (!text.trim() || !localUserId) return;

    const saved = await saveWorryDump(localUserId, text);
    setDumps([saved, ...dumps]);
    setText('');
  };

  const handleDelete = async (id: number) => {
    await deleteWorryDump(id);
    setDumps(dumps.filter(d => d.id !== id));
    setDeleteIdConfirm(null);
  };

  const handleAppendPrompt = (prompt: string) => {
    setText(prev => (prev ? `${prev} ${prompt}` : prompt));
  };

  return (
    <div className="worry-dump-card">
      <div className="worry-header">
        <h3 className="worry-title">Pre-Exam Worry Dump Journal</h3>
        <p className="worry-subtitle">
          Unload your fears onto paper before studying to free up working memory. Stored locally on this device only.
        </p>
      </div>

      <div className="worry-prompts-row">
        <span className="prompts-label">Quick Prompts:</span>
        {WORRY_PROMPTS.map((p, i) => (
          <button
            key={i}
            type="button"
            className="prompt-chip"
            onClick={() => handleAppendPrompt(p)}
          >
            + {p}
          </button>
        ))}
      </div>

      <div className="worry-input-wrapper">
        <textarea
          className="worry-textarea"
          placeholder="Write down everything worrying you about the upcoming exam..."
          value={text}
          maxLength={5000}
          onChange={e => setText(e.target.value)}
        />
        <div className="worry-footer-row">
          <span className="char-count">{text.length}/5000</span>
          <button
            type="button"
            className="btn-save-worry"
            disabled={!text.trim()}
            onClick={handleSave}
          >
            Unload Worry 📥
          </button>
        </div>
      </div>

      {dumps.length > 0 && (
        <div className="worry-history-list">
          <h4 className="history-title">Previous Worry Dumps ({dumps.length})</h4>
          {dumps.map(item => (
            <div key={item.id} className="worry-history-item">
              <div className="item-meta">
                <span className="item-date">
                  {new Date(item.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                {deleteIdConfirm === item.id ? (
                  <div className="delete-confirm-group">
                    <span className="confirm-text">Delete?</span>
                    <button
                      type="button"
                      className="btn-confirm-yes"
                      onClick={() => item.id && handleDelete(item.id)}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className="btn-confirm-no"
                      onClick={() => setDeleteIdConfirm(null)}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn-delete"
                    onClick={() => item.id && setDeleteIdConfirm(item.id)}
                  >
                    Delete 🗑
                  </button>
                )}
              </div>
              <p className="item-body">{item.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
