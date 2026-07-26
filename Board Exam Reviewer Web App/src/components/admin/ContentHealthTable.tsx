import React, { useState } from 'react';
import type { QuestionHealthRecord } from './hooks/useContentHealth';
import { db, type LocalQuestion } from '../../lib/db';
import { Badge } from '../Badge';
import './ContentHealthTable.css';

interface ContentHealthTableProps {
  records: QuestionHealthRecord[];
}

export const ContentHealthTable: React.FC<ContentHealthTableProps> = ({ records }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<LocalQuestion | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<'all' | 'bad_question' | 'hard_topic'>('all');

  const handleRowClick = async (questionId: string) => {
    if (expandedId === questionId) {
      setExpandedId(null);
      setExpandedQuestion(null);
      return;
    }

    setExpandedId(questionId);
    setLoadingId(questionId);
    try {
      const q = await db.questions.get(questionId);
      setExpandedQuestion(q || null);
    } catch (err) {
      console.error('Failed to load question details:', err);
    } finally {
      setLoadingId(null);
    }
  };

  const filteredRecords = records.filter(r => {
    if (filterTag === 'all') return true;
    return r.flag === filterTag;
  });

  return (
    <div className="content-health-container">
      <div className="table-filter-bar">
        <h3>Question Performance & Health Data</h3>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterTag === 'all' ? 'active' : ''}`}
            onClick={() => setFilterTag('all')}
          >
            All ({records.length})
          </button>
          <button
            className={`filter-btn ${filterTag === 'bad_question' ? 'active' : ''}`}
            onClick={() => setFilterTag('bad_question')}
          >
            🚨 Bad Questions ({records.filter(r => r.flag === 'bad_question').length})
          </button>
          <button
            className={`filter-btn ${filterTag === 'hard_topic' ? 'active' : ''}`}
            onClick={() => setFilterTag('hard_topic')}
          >
            ⚠️ Hard Topics ({records.filter(r => r.flag === 'hard_topic').length})
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="health-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Question ID</th>
              <th>Category</th>
              <th>Subtopic</th>
              <th>Attempts</th>
              <th>Fail Rate</th>
              <th>Avg Time</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-table-cell">
                  No questions match the selected filter.
                </td>
              </tr>
            ) : (
              filteredRecords.map(r => {
                const isExpanded = expandedId === r.questionId;
                const failPct = Math.round(r.failRate * 100);
                const avgSecs = Math.round(r.avgTimeSpentMs / 1000);

                return (
                  <React.Fragment key={r.questionId}>
                    <tr
                      className={`health-row ${r.flag !== 'none' ? `row-${r.flag}` : ''} ${isExpanded ? 'expanded' : ''}`}
                      onClick={() => handleRowClick(r.questionId)}
                    >
                      <td>
                        {r.flag === 'bad_question' && <Badge variant="incorrect">🚨 Review Key</Badge>}
                        {r.flag === 'hard_topic' && <Badge variant="gold">⚠️ Hard Topic</Badge>}
                        {r.flag === 'none' && <Badge variant="teal">OK</Badge>}
                      </td>
                      <td className="q-id-cell">{r.questionId}</td>
                      <td>{r.subjectArea}</td>
                      <td>{r.subtopic}</td>
                      <td>{r.attemptCount}</td>
                      <td className={`fail-rate-cell ${failPct >= 70 ? 'high-fail' : ''}`}>{failPct}%</td>
                      <td>{avgSecs}s</td>
                    </tr>
                    {isExpanded && (
                      <tr className="detail-row">
                        <td colSpan={7}>
                          <div className="detail-box">
                            {loadingId === r.questionId ? (
                              <div>Loading question content...</div>
                            ) : expandedQuestion ? (
                              <div>
                                <p className="detail-question-text"><strong>Question:</strong> {expandedQuestion.question_text}</p>
                                <div className="detail-options-list">
                                  {expandedQuestion.options?.map((opt, idx) => (
                                    <div
                                      key={idx}
                                      className={`detail-opt ${opt.key === expandedQuestion.correct_option ? 'correct' : ''}`}
                                    >
                                      <strong>{opt.key}:</strong> {opt.text} {opt.key === expandedQuestion.correct_option && '✓ (Correct)'}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div>Could not load details for this question.</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
