import React, { useState, useEffect, Component } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import { useMockExamSession } from '../hooks/useMockExamSession';
import { ExamHeader } from '../components/exam/ExamHeader';
import { QuestionPalette } from '../components/exam/QuestionPalette';
import { SubmitConfirmationModal } from '../components/exam/SubmitConfirmationModal';
import { PauseOverlay } from '../components/exam/PauseOverlay';
import { ExitModal } from '../components/exam/ExitModal';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { CheckoutModal } from '../components/paywall/CheckoutModal';
import './MockExamSession.css';


class MockExamErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return React.createElement('div', {
        style: { padding: '3rem', textAlign: 'center', fontFamily: 'Inter, sans-serif' }
      },
        React.createElement('h2', { style: { color: '#e74c3c' } }, 'Exam Session Error'),
        React.createElement('pre', {
          style: { background: '#f5f5f5', padding: '1rem', borderRadius: '8px', margin: '1rem auto', maxWidth: '600px', textAlign: 'left', overflow: 'auto', fontSize: '0.85rem' }
        },
          this.state.error.message,
          '\n\n',
          this.state.error.stack
        ),
        React.createElement('button', {
          onClick: () => { window.location.href = '/dashboard'; },
          style: { padding: '10px 24px', background: '#0D7377', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' }
        }, 'Return to Dashboard')
      );
    }
    return this.props.children;
  }
}

const MockExamSessionInner: React.FC = () => {
  const { examId = 'cse-professional-v1' } = useParams<{ examId: string }>();
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get('mode') as 'practice' | 'simulation') || 'practice';

  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const userId = profile?.id || 'guest-device';

  const session = useMockExamSession(examId, mode, userId);

  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState<boolean>(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);

  // Redirect to results on completion
  useEffect(() => {
    if (session.sessionState === 'completed' && session.attempt) {
      navigate(`/exam/${session.attempt.id}/results`);
    }
  }, [session.sessionState, session.attempt, navigate]);

  // Keyboard navigation (ABCD, Arrows, F flag)
  useEffect(() => {
    if (session.sessionState !== 'answering') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        session.selectOption(session.currentIndex, key as 'A' | 'B' | 'C' | 'D');
      } else if (e.key === 'ArrowRight') {
        session.navigateNext();
      } else if (e.key === 'ArrowLeft') {
        session.navigatePrev();
      } else if (key === 'F') {
        session.toggleFlag(session.currentIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [session]);

  if (session.sessionState === 'initializing') {
    return (
      <div className="session-status-container">
        <div className="spinner" />
        <p>Loading Mock Exam Session...</p>
      </div>
    );
  }

  if (session.sessionState === 'error') {
    if (session.errorMessage === 'FREE_TIER_SIMULATION_LIMIT_REACHED') {
      return (
        <div className="session-status-container">
          <Card className="error-card paywall-limit-card">
            <h2>🔒 Free Simulation Limit Reached</h2>
            <p>You have completed your 1 free 170-item simulation exam! Upgrade to <strong>Gabay Pro Pass</strong> to unlock unlimited simulation retakes, all 2,910+ questions, and smart Leitner spaced repetition.</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'center' }}>
              <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                Return to Dashboard
              </Button>
              <Button variant="primary" onClick={() => setShowCheckoutModal(true)}>
                Unlock Gabay Pro Pass →
              </Button>
            </div>
          </Card>
          {showCheckoutModal && (
            <CheckoutModal onClose={() => setShowCheckoutModal(false)} />
          )}
        </div>
      );
    }

    return (
      <div className="session-status-container">
        <Card className="error-card">
          <h2>⚠️ Unable to Start Exam</h2>
          <p>{session.errorMessage}</p>
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  // Pre-Exam Intro Screen (ephemeral M4, L6)
  if (session.sessionState === 'instructions') {
    return (
      <div className="exam-instructions-container">
        <Card className="instructions-card">
          <div className="intro-header">
            <span className="exam-badge">{session.exam?.exam_type.toUpperCase()}</span>
            <h1>{session.exam?.title}</h1>
          </div>

          <div className="intro-disclaimer-box">
            <p className="disclaimer-text">
              📌 <strong>Educational Simulation — Not an Official CSC Exam:</strong> This 170-item mock exam is an independent practice simulation, <strong>not affiliated with or sourced from the CSC</strong>. It's designed to help you practice time management, experience realistic exam pressure, and identify weak subtopics. Questions are original and modeled on publicly known CSE-PPT competency areas (verbal, numerical, general information, clerical) — they are not reproductions of actual CSC exam items. Your score here does not predict or guarantee your outcome on the official exam.
            </p>
          </div>

          <div className="exam-meta-grid">
            <div className="meta-box">
              <span className="meta-val">{session.exam?.total_questions}</span>
              <span className="meta-lbl">Total Questions</span>
            </div>
            <div className="meta-box">
              <span className="meta-val">{session.exam?.time_limit_minutes} min</span>
              <span className="meta-lbl">Global Time Limit</span>
            </div>
            <div className="meta-box">
              <span className="meta-val">{mode === 'practice' ? 'Practice' : 'Simulation'}</span>
              <span className="meta-lbl">Selected Mode</span>
            </div>
          </div>

          <div className="section-breakdown-list">
            <h3>Exam Section Overview (Advisory Times):</h3>
            {session.sections.map(sec => (
              <div key={sec.section_id} className="section-row">
                <span className="sec-name">{sec.name}</span>
                <span className="sec-count">{sec.question_count} items</span>
                <span className="sec-time">~{sec.advisory_time_minutes} min advisory</span>
              </div>
            ))}
          </div>

          {session.showResumePrompt ? (
            <div className="resume-prompt-box">
              <p>⚠️ An active in-progress attempt was found from a previous session.</p>
              <div className="resume-actions">
                <Button variant="secondary" onClick={() => session.startExam(false)}>
                  Start Fresh Attempt
                </Button>
                <Button variant="primary" onClick={() => session.startExam(true)}>
                  Resume Active Attempt ▶
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="primary" size="lg" fullWidth onClick={() => session.startExam(false)}>
              Begin Exam Session 🚀
            </Button>
          )}
        </Card>
      </div>
    );
  }

  const currentQ = session.currentQuestion;
  const currentA = session.currentAnswer;
  const currentSection = session.sections.find(s => s.category_ids.includes(currentQ?.category_id || ''));

  if (session.sessionState === 'answering' && (!currentQ || session.questions.length === 0)) {
    return (
      <div className="session-status-container" style={{ padding: '2rem', textAlign: 'center' }}>
        <Card className="error-card" style={{ maxWidth: '500px', margin: '2rem auto' }}>
          <h2>⚠️ Preparing Mock Exam Session</h2>
          <p style={{ margin: '1rem 0' }}>The test paper is assembling its 170 exam questions.</p>
          <Button variant="primary" onClick={() => session.startExam(false)}>
            Start Fresh Simulation Session 🚀
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mock-exam-session-layout">
      {/* Sticky Header */}
      <ExamHeader
        title={session.exam?.title || 'Civil Service Exam'}
        sectionName={currentSection?.name || 'Section'}
        currentIndex={session.currentIndex}
        totalQuestions={session.questions.length}
        remainingSeconds={session.timer.remainingSeconds}
        mode={mode}
        isPaused={session.sessionState === 'paused'}
        isFlagged={currentA?.flagged || false}
        onTogglePalette={() => setIsPaletteOpen(!isPaletteOpen)}
        onToggleFlag={() => session.toggleFlag(session.currentIndex)}
        onPauseResume={session.sessionState === 'paused' ? session.resumeSession : session.pauseSession}
      />

      <div className="session-body-grid">
        {/* Main Question Panel */}
        <main className="question-runner-main">
          {/* Advisory Section Banner (INV-020) */}
          <div className="advisory-section-banner">
            <span>📍 Current Section: <strong>{currentSection?.name || 'General'}</strong></span>
            <span className="advisory-pill">Advisory Time: ~{currentSection?.advisory_time_minutes || 40} min</span>
          </div>

          {currentQ && (
            <Card className="question-card">
              <div className="q-card-header">
                <span className="q-num-badge">Question {session.currentIndex + 1} of {session.questions.length}</span>
                <span className="subtopic-badge">{currentQ.subtopic}</span>
              </div>

              <p className="q-stem-text">{currentQ.question_text}</p>

              <div className="q-options-grid">
                {(() => {
                  const rawOpts = (currentQ.options as any) || [];
                  const normOpts: { key: string; text: string }[] = Array.isArray(rawOpts)
                    ? rawOpts.map((opt: any, idx: number) => {
                        if (typeof opt === 'string') {
                          return { key: String.fromCharCode(65 + idx), text: opt };
                        }
                        if (opt && typeof opt === 'object') {
                          return {
                            key: opt.key || opt.id || String.fromCharCode(65 + idx),
                            text: opt.text || opt.label || opt.value || ''
                          };
                        }
                        return { key: String.fromCharCode(65 + idx), text: String(opt) };
                      })
                    : Object.entries(rawOpts).map(([k, v]) => ({
                        key: k,
                        text: typeof v === 'string' ? v : (v as any)?.text || String(v)
                      }));

                  return normOpts.map(opt => {
                    const isSelected = currentA?.chosen_option === opt.key;
                    return (
                      <button
                        key={opt.key}
                        className={`option-choice-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => session.selectOption(session.currentIndex, opt.key as 'A' | 'B' | 'C' | 'D')}
                      >
                        <span className="opt-key">{opt.key}</span>
                        <span className="opt-text">{opt.text}</span>
                      </button>
                    );
                  });
                })()}
              </div>
            </Card>
          )}

          {/* Bottom Navigation Controls */}
          <div className="runner-nav-controls">
            <Button
              variant="secondary"
              disabled={session.currentIndex === 0}
              onClick={session.navigatePrev}
            >
              ◀ Previous
            </Button>

            <Button variant="secondary" onClick={() => setIsExitModalOpen(true)}>
              Exit Exam
            </Button>

            {session.currentIndex === session.questions.length - 1 ? (
              <Button variant="primary" onClick={() => setIsSubmitModalOpen(true)}>
                Submit Exam 🏁
              </Button>
            ) : (
              <Button variant="primary" onClick={session.navigateNext}>
                Next Question ▶
              </Button>
            )}
          </div>
        </main>

        {/* Question Palette Drawer/Sidebar */}
        <aside className={`palette-sidebar ${isPaletteOpen ? 'open' : ''}`}>
          <div className="palette-sidebar-header">
            <h3>Question Palette</h3>
            <button className="close-palette-btn" onClick={() => setIsPaletteOpen(false)}>✕</button>
          </div>

          <QuestionPalette
            totalQuestions={session.questions.length}
            currentIndex={session.currentIndex}
            answersMap={session.answersMap}
            onSelectIndex={idx => {
              session.jumpToIndex(idx);
              setIsPaletteOpen(false);
            }}
            onToggleFlag={session.toggleFlag}
            mode="live"
          />
        </aside>
      </div>

      {/* Modals & Overlays */}
      <SubmitConfirmationModal
        isOpen={isSubmitModalOpen}
        unansweredCount={session.getSubmitDetails().unansweredCount}
        flaggedCount={session.getSubmitDetails().flaggedCount}
        timeRemainingSeconds={session.timer.remainingSeconds}
        mode={mode}
        onConfirmSubmit={() => session.finalizeSubmission('completed')}
        onCancel={() => setIsSubmitModalOpen(false)}
      />

      <PauseOverlay
        isPaused={session.sessionState === 'paused'}
        questionStemText={currentQ?.question_text}
        onResume={session.resumeSession}
        onExit={() => {
          session.abandonSession();
          navigate('/dashboard');
        }}
      />

      <ExitModal
        isOpen={isExitModalOpen}
        mode={mode}
        onResume={() => setIsExitModalOpen(false)}
        onSavePause={async () => {
          await session.pauseSession();
          navigate('/dashboard');
        }}
        onAbandon={async () => {
          await session.abandonSession();
          navigate('/dashboard');
        }}
      />
    </div>
  );
};


export const MockExamSession: React.FC = () => {
  return React.createElement(
    MockExamErrorBoundary,
    null,
    React.createElement(MockExamSessionInner)
  );
};


export default MockExamSession;
