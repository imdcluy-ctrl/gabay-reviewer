import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import { useEntitlement } from '../hooks/useEntitlement';
import { useGameSession } from '../hooks/useGameSession';
import { createInitialState, processAnswer, isGameOver, DEFAULT_STREAK_SETTINGS, loadSavedFreezes, canRestoreToday, markRestoreUsed } from '../lib/gameScoring';
import { selectStreakQuestion, loadUsedToday, saveUsedToday } from '../lib/gameSelection';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import type { DailyStreakState } from '../types/game';
import type { LocalQuestion } from '../lib/db';
import {
  trackStreakSessionStarted,
  trackStreakQuestionAnswered,
  trackStreakFreezeUsed,
  trackStreakMilestoneReached,
  trackStreakSessionCompleted,
  trackStreakRestoreUsed,
} from '../lib/streakMetrics';
import { AdUnit } from '../components/AdUnit';
import './GameSession.css';

export const GameSession: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { isPremium } = useEntitlement();
  const { bestStreak, alreadyPlayedToday, saveSession } = useGameSession();
  const userId = profile?.id || 'guest-device';

  const [state, setState] = useState<DailyStreakState>(() => {
    const s = createInitialState(bestStreak);
    s.freezesAvailable = loadSavedFreezes();
    return s;
  });
  const [question, setQuestion] = useState<LocalQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [freezeActive, setFreezeActive] = useState(false);
  const [showRestore, setShowRestore] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const usedToday = useRef(loadUsedToday());

  const loadQuestion = useCallback(async () => {
    setLoading(true);
    const q = await selectStreakQuestion(userId, isPremium, usedToday.current, DEFAULT_STREAK_SETTINGS.blend);
    if (q) {
      const fullQ = await import('../lib/db').then(m => m.db.questions.get(q.questionId));
      setQuestion(fullQ || null);
      usedToday.current.add(q.questionId);
      saveUsedToday(usedToday.current);
    } else {
      setQuestion(null);
    }
    setLoading(false);
    setSelectedOption(null);
    setIsCorrect(null);
    setFreezeActive(false);
  }, [userId, isPremium]);

  useEffect(() => { loadQuestion(); }, [loadQuestion]);

  // Track session started on first mount
  useEffect(() => {
    trackStreakSessionStarted();
  }, []);

  const handlePracticeAnswer = (key: string) => {
    if (!question) return;
    const correct = key === question.correct_option;
    setSelectedOption(key);
    setIsCorrect(correct);
    setTimeout(() => {
      loadQuestion();
    }, 600);
  };

  const handleRestore = () => {
    markRestoreUsed();
    setState(prev => ({ ...prev, livesRemaining: 3, status: 'playing' }));
    setShowRestore(false);
    trackStreakRestoreUsed();
  };

  const handleAnswer = (key: string) => {
    if (practiceMode) {
      handlePracticeAnswer(key);
      return;
    }
    if (selectedOption || !question) return;
    const correct = key === question.correct_option;
    setIsCorrect(correct);
    setSelectedOption(key);

    // Track the answer
    trackStreakQuestionAnswered(correct, state.currentStreak);

    // Track milestone reached (5, 10, 25, 50, 100, etc.)
    const streakAfter = state.currentStreak + (correct ? 1 : 0);
    if (correct && DEFAULT_STREAK_SETTINGS.streakMilestones.includes(streakAfter)) {
      trackStreakMilestoneReached(streakAfter);
    }

    setTimeout(() => {
      const next = processAnswer(state, correct, DEFAULT_STREAK_SETTINGS);
      setState(next);

      if (correct) {
        setFreezeActive(false);
      } else if (state.freezesAvailable > 0) {
        setFreezeActive(true);
        trackStreakFreezeUsed(state.currentStreak);
      }

      if (isGameOver(next)) {
        if (state.livesRemaining <= 0 && canRestoreToday()) {
          setShowRestore(true);
          return;
        }
        setShowResult(true);
        // Track completed session
        trackStreakSessionCompleted({
          finalStreak: next.bestStreakEver,
          totalAnswered: next.totalAnswered,
          totalCorrect: next.totalCorrect,
          freezesUsed: next.livesRemaining < 3 ? 1 : 0, // approximation: life lost = freeze or mistake
          score: next.score,
          durationSeconds: 0,
        });
        saveSession({
          localUserId: userId,
          date: new Date().toLocaleDateString('en-CA'),
          finalStreak: next.bestStreakEver,
          totalCorrect: next.totalCorrect,
          totalAnswered: next.totalAnswered,
          score: next.score,
          freezesUsed: 0,
          freezesEarned: next.freezesAvailable,
          durationSeconds: 0,
        });
      } else {
        loadQuestion();
      }
    }, 800);
  };

  if (alreadyPlayedToday && !showResult) {
    return (
      <div className="streak-game-layout page-wrapper">
        <Header title="Streak Mode" showBack onBack={() => navigate('/dashboard')} />
        <main className="streak-done-container">
          <Card className="streak-done-card">
            <span className="streak-done-icon">✅</span>
            <h2>Done for Today!</h2>
            <p className="streak-done-sub">You've already completed today's streak challenge.</p>
            <div className="streak-done-stats">
              <div className="sd-stat">
                <span className="sd-val">{bestStreak}</span>
                <span className="sd-lbl">Best Streak</span>
              </div>
            </div>
            <Button variant="primary" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </Card>
          <AdUnit slotId="7447186651" format="fluid" layoutKey="-fb+5w+4e-db+86" minHeight="60px" label="SPONSORED" />
        </main>
      </div>
    );
  }

  if (showRestore) {
    return (
      <div className="streak-game-layout page-wrapper">
        <main className="streak-result-container">
          <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '32px 24px', background: 'var(--color-bg-card)', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>🔥</span>
            <h2>Don" + "'t Give Up!</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>You ran out of lives but you can continue once today.<br />Keep going!</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleRestore}
                style={{ padding: '14px 24px', background: 'linear-gradient(135deg, #F97316, #EA580C)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}
              >
                Continue 🚀
              </button>
              <button
                onClick={() => {
                  setShowRestore(false);
                  setPracticeMode(true);
                }}
                style={{ padding: '12px 24px', background: 'rgba(20,184,166,0.1)', color: '#14B8A6', border: '1.5px solid rgba(20,184,166,0.3)', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
              >
                Practice Unscored 📝
              </button>
              <button
                onClick={() => {
                  setShowRestore(false);
                  setShowResult(true);
                  saveSession({
                    localUserId: userId,
                    date: new Date().toLocaleDateString('en-CA'),
                    finalStreak: state.bestStreakEver,
                    totalCorrect: state.totalCorrect,
                    totalAnswered: state.totalAnswered,
                    score: state.score,
                    freezesUsed: 0,
                    freezesEarned: state.freezesAvailable,
                    durationSeconds: 0,
                  });
                }}
                style={{ padding: '12px 24px', background: 'transparent', color: 'var(--color-text-secondary)', border: '1.5px solid var(--color-border)', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
              >
                End Session
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="streak-game-layout page-wrapper">
        <main className="streak-result-container">
          <Card className="streak-result-card">
            <span className="streak-result-icon">
              {state.totalCorrect >= 10 ? '🌟' : '💪'}
            </span>
            <h2>Session Complete!</h2>
            <div className="result-stats-grid">
              <div className="result-stat">
                <span className="rs-val">{state.bestStreakEver}</span>
                <span className="rs-lbl">Best Streak</span>
              </div>
              <div className="result-stat">
                <span className="rs-val">{state.totalCorrect}/{state.totalAnswered}</span>
                <span className="rs-lbl">Correct</span>
              </div>
              <div className="result-stat">
                <span className="rs-val">{state.score}</span>
                <span className="rs-lbl">Score</span>
              </div>
            </div>
            <Button variant="primary" fullWidth onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </Card>
          <AdUnit slotId="7447186651" format="fluid" layoutKey="-fb+5w+4e-db+86" minHeight="60px" label="SPONSORED" />
        </main>
      </div>
    );
  }

  if (loading || !question) {
    return (
      <div className="streak-game-layout page-wrapper">
        <Header title="Streak Mode" showBack onBack={() => navigate('/dashboard')} />
        <main className="streak-loading">
          <div className="spinner" />
          <p>Loading your streak challenge...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="streak-game-layout page-wrapper">
      {/* Top bar: lives + streak + score */}
      <div className="streak-topbar">
        <button className="streak-back-btn" onClick={() => navigate('/dashboard')}>✕</button>
        <div className="streak-metrics">
          <span className="streak-lives">
            {'❤️'.repeat(Math.max(0, state.livesRemaining))}
            {'🖤'.repeat(Math.max(0, 3 - state.livesRemaining))}
          </span>
          <span className="streak-counter">
            🔥 {state.currentStreak}
          </span>
          <span className="streak-score">{state.score} pts</span>
        </div>
      </div>

      <main className="streak-question-area">
        <Card className="streak-question-card">
          <div className="sq-meta">
            <span className="sq-num">#{state.totalAnswered + 1}</span>
            <span className="sq-cat">{question.subtopic || question.category_id}</span>
          </div>
          <p className="sq-text">{question.question_text}</p>

          <div className="sq-options">
            {([{key:'A',text:question.options.find(o=>o.key==='A')?.text||''},{key:'B',text:question.options.find(o=>o.key==='B')?.text||''},{key:'C',text:question.options.find(o=>o.key==='C')?.text||''},{key:'D',text:question.options.find(o=>o.key==='D')?.text||''}] as {key:string;text:string}[]).map(opt => {
              const isSelected = selectedOption === opt.key;
              const isCorrectOption = question.correct_option === opt.key;
              let className = 'sq-opt';
              if (isSelected && isCorrect) className += ' sq-opt-correct';
              else if (isSelected && !isCorrect) className += ' sq-opt-wrong';
              else if (isCorrectOption && selectedOption) className += ' sq-opt-reveal';

              return (
                <button
                  key={opt.key}
                  className={className}
                  onClick={() => handleAnswer(opt.key)}
                  disabled={selectedOption !== null}
                >
                  <span className="sq-opt-key">{opt.key}</span>
                  <span className="sq-opt-text">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {practiceMode && (
            <div className="practice-banner">
              📝 Practice mode — score unaffected
            </div>
          )}
          {freezeActive && (
            <div className="freeze-banner">
              🧊 Freeze used! Streak continues.
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default GameSession;
