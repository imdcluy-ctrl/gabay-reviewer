import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import { useEntitlement } from '../hooks/useEntitlement';
import { useGameSession } from '../hooks/useGameSession';
import { createInitialState, processAnswer, isGameOver, DEFAULT_STREAK_SETTINGS } from '../lib/gameScoring';
import { selectStreakQuestion, loadUsedToday, saveUsedToday } from '../lib/gameSelection';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import type { DailyStreakState } from '../types/game';
import type { LocalQuestion } from '../lib/db';
import './GameSession.css';

export const GameSession: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { isPremium } = useEntitlement();
  const { bestStreak, alreadyPlayedToday, saveSession } = useGameSession();
  const userId = profile?.id || 'guest-device';

  const [state, setState] = useState<DailyStreakState>(() => createInitialState(bestStreak));
  const [question, setQuestion] = useState<LocalQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [freezeActive, setFreezeActive] = useState(false);
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

  const handleAnswer = (key: string) => {
    if (selectedOption || !question) return;
    const correct = key === question.correct_option;
    setIsCorrect(correct);
    setSelectedOption(key);

    setTimeout(() => {
      const next = processAnswer(state, correct, DEFAULT_STREAK_SETTINGS);
      setState(next);

      if (correct) {
        setFreezeActive(false);
      } else if (state.freezesAvailable > 0) {
        setFreezeActive(true);
      }

      if (isGameOver(next)) {
        setShowResult(true);
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
