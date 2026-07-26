import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/db';
import { useUserProfile } from '../hooks/useUserProfile';
import type { MockExamAttempt } from '../types/mockExam';
import { RetakeLauncher } from '../components/exam/RetakeLauncher';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import './ExamHistory.css';

export type HistoryFilter = 'all' | 'passed' | 'failed' | 'professional' | 'subprofessional' | 'practice' | 'simulation';
export type HistorySort = 'newest' | 'highest_score';

export const ExamHistory: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [attempts, setAttempts] = useState<MockExamAttempt[]>([]);
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>('all');
  const [activeSort, setActiveSort] = useState<HistorySort>('newest');

  // Retake Launcher Modal state
  const [activeRetakeModal, setActiveRetakeModal] = useState<{ examId: string; title: string } | null>(null);

  useEffect(() => {
    async function loadHistory() {
      if (!profile) return;
      try {
        setIsLoading(true);

        const attemptRows = await db.mock_exam_attempts
          .where('local_user_id')
          .equals(profile.id)
          .filter(a => a.status === 'completed' || a.status === 'auto_submitted')
          .toArray();

        setAttempts(attemptRows);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading exam history:', err);
        setIsLoading(false);
      }
    }
    loadHistory();
  }, [profile]);

  // M3: Filter logic
  const filteredAttempts = attempts.filter(att => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'passed') return att.passed === true;
    if (activeFilter === 'failed') return att.passed === false;
    if (activeFilter === 'professional') return att.mock_exam_id.includes('professional');
    if (activeFilter === 'subprofessional') return att.mock_exam_id.includes('subprofessional');
    if (activeFilter === 'practice') return att.mode === 'practice';
    if (activeFilter === 'simulation') return att.mode === 'simulation';
    return true;
  });

  // M3 / L5: Sort logic (completed_at vs score percentage)
  filteredAttempts.sort((a, b) => {
    if (activeSort === 'highest_score') {
      return (b.percentage || 0) - (a.percentage || 0);
    }
    // Newest first (completed_at)
    const dateA = new Date(a.completed_at || a.started_at).getTime();
    const dateB = new Date(b.completed_at || b.started_at).getTime();
    return dateB - dateA;
  });

  if (isLoading) {
    return (
      <div className="history-status-container">
        <div className="spinner" />
        <p>Loading Attempt History...</p>
      </div>
    );
  }

  return (
    <div className="exam-history-layout">
      <header className="history-top-header">
        <div className="history-header-left">
          <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>
            ◀ Dashboard
          </Button>
          <h1>Mock Exam Attempt History</h1>
        </div>

        {/* M3: Filter & Sort Toolbar */}
        <div className="history-toolbar">
          <div className="history-filters">
            {(['all', 'passed', 'failed', 'professional', 'subprofessional', 'practice', 'simulation'] as const).map(f => (
              <button
                key={f}
                className={`filter-btn ${activeFilter === f ? 'active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f === 'subprofessional' ? 'Sub-Pro' : f.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="history-sort-select">
            <label>Sort:</label>
            <select value={activeSort} onChange={e => setActiveSort(e.target.value as HistorySort)}>
              <option value="newest">Newest First</option>
              <option value="highest_score">Highest Score</option>
            </select>
          </div>
        </div>
      </header>

      <main className="history-content-container">
        {filteredAttempts.length === 0 ? (
          <Card className="empty-history-card">
            <h3>No Completed Attempts Found</h3>
            <p>You haven't completed any mock exam sessions matching this filter yet.</p>
            <Button variant="primary" onClick={() => navigate('/exam/cse-professional-v1')}>
              Start New Simulation Exam
            </Button>
          </Card>
        ) : (
          <div className="history-card-list">
            {filteredAttempts.map(att => {
              // L4: Active time spent formula
              const startedTime = new Date(att.started_at).getTime();
              const completedTime = new Date(att.completed_at || att.started_at).getTime();
              const activeSecs = Math.max(0, Math.round((completedTime - startedTime - (att.paused_accumulated_ms || 0)) / 1000));
              const activeMins = Math.round(activeSecs / 60);

              const isPro = att.mock_exam_id.includes('professional');

              return (
                <Card key={att.id} className={`history-item-card ${att.passed ? 'passed' : 'failed'}`}>
                  <div className="history-item-header">
                    <div className="title-and-badges">
                      <span className="exam-type-badge">{isPro ? 'Professional Tier' : 'Sub-Professional Tier'}</span>
                      <span className={`mode-badge ${att.mode}`}>
                        {att.mode === 'practice' ? 'Practice Mode' : 'Real Simulation'}
                      </span>

                      {/* M3: Amber Integrity Flag Indicator */}
                      {att.integrity_flag === 'clock_anomaly' && (
                        <span className="integrity-badge" title="Clock changes detected during attempt">
                          ⚠️ Clock Anomaly
                        </span>
                      )}
                    </div>

                    <span className="attempt-date font-mono">
                      {new Date(att.completed_at || att.started_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="history-score-row">
                    <div className="score-badge-box">
                      <span className="score-percentage">{att.percentage}%</span>
                      <span className="score-status-text">{att.passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}</span>
                    </div>

                    <div className="time-meta font-mono">
                      <span>⏱ Active Time: <strong>{activeMins} mins</strong></span>
                      <span>Target Cutoff: 80%</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="history-actions-row">
                    <Button variant="secondary" size="sm" onClick={() => navigate(`/exam/${att.id}/results`)}>
                      Performance Diagnostics 📊
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => navigate(`/exam/${att.id}/review`)}>
                      Socratic Answer Review 📖
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setActiveRetakeModal({ examId: att.mock_exam_id, title: isPro ? 'Professional Exam' : 'Sub-Professional Exam' })}
                    >
                      Retake Exam 🔄
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Retake Launcher Modal */}
      {activeRetakeModal && profile && (
        <RetakeLauncher
          mockExamId={activeRetakeModal.examId}
          examTitle={activeRetakeModal.title}
          userId={profile.id}
          onClose={() => setActiveRetakeModal(null)}
          onLaunch={newAttemptId => {
            setActiveRetakeModal(null);
            navigate(`/exam/${newAttemptId}`);
          }}
        />
      )}
    </div>
  );
};

export default ExamHistory;
