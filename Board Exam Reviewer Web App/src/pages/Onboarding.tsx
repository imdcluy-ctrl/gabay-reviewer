import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import { db } from '../lib/db';
import type { LocalQuestion } from '../lib/db';
import { EXAM_LEVELS, DEFAULT_EXAM_DATE, CATEGORIES } from '../lib/constants';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import './Onboarding.css';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();

  const [step, setStep] = useState<number>(1);
  const [examLevel, setExamLevel] = useState<string>('professional');
  const [examDate, setExamDate] = useState<string>(DEFAULT_EXAM_DATE);

  // Diagnostic state
  const [diagnosticQuestions, setDiagnosticQuestions] = useState<LocalQuestion[]>([]);
  const [currentDiagIndex, setCurrentDiagIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // question_id -> chosen option
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isDiagnosticDone, setIsDiagnosticDone] = useState<boolean>(false);

  useEffect(() => {
    async function loadDiagnosticQuestions() {
      const allQuestions = await db.questions.toArray();
      if (allQuestions.length > 0) {
        // Pick 1 question per category
        const categoryMap = new Map<string, LocalQuestion>();
        allQuestions.forEach(q => {
          if (!categoryMap.has(q.category_id)) {
            categoryMap.set(q.category_id, q);
          }
        });
        const selected = Array.from(categoryMap.values()).slice(0, 5);
        setDiagnosticQuestions(selected);
      }
    }
    loadDiagnosticQuestions();
  }, []);

  const handleLevelSelect = (levelId: string) => {
    setExamLevel(levelId);
    setTimeout(() => setStep(2), 300);
  };

  const handleOptionClick = (optionKey: string) => {
    setSelectedOption(optionKey);
    const currentQ = diagnosticQuestions[currentDiagIndex];
    if (!currentQ) return;
    const newAnswers = { ...answers, [currentQ.id]: optionKey };
    setAnswers(newAnswers);

    setTimeout(() => {
      setSelectedOption(null);
      if (currentDiagIndex + 1 < diagnosticQuestions.length) {
        setCurrentDiagIndex(prev => prev + 1);
      } else {
        setIsDiagnosticDone(true);
      }
    }, 500);
  };

  const handleCompleteOnboarding = async () => {
    if (!profile) return;
    await db.user_profile.update(profile.id, {
      exam_level: examLevel,
      exam_target: `cse-${examLevel}`,
      exam_date: examDate,
      onboarding_completed: true,
    });
    navigate('/dashboard');
  };

  // Score calculation for copy selection (never displayed as a raw score)
  const calculateScore = () => {
    let score = 0;
    diagnosticQuestions.forEach(q => {
      if (answers[q.id] === q.correct_option) score += 1;
    });
    return score;
  };

  const score = calculateScore();
  const currentDiagQ = diagnosticQuestions[currentDiagIndex];

  return (
    <div className="onboarding-container">
      {/* Progress Dots */}
      <div className="onboarding-progress">
        <div className={`progress-dot ${step >= 1 ? 'active' : ''}`} />
        <div className={`progress-dot ${step >= 2 ? 'active' : ''}`} />
        <div className={`progress-dot ${step >= 3 ? 'active' : ''}`} />
      </div>

      <div className="onboarding-card-wrapper">
        {step === 1 && (
          <div className="step-content">
            <h2 className="step-heading">What exam are you preparing for?</h2>
            <p className="step-subtext">Choose your target level for tailored questions</p>

            <div className="level-cards">
              {Object.values(EXAM_LEVELS).map(level => {
                const isSelected = examLevel === level.id;
                return (
                  <Card
                    key={level.id}
                    variant="interactive"
                    className={`level-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleLevelSelect(level.id)}
                  >
                    <div className="level-icon">{level.icon}</div>
                    <div className="level-info">
                      <h3>{level.name}</h3>
                      <p>{level.items} items · {level.minutes} minutes · For {level.salaryGrade}</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <h2 className="step-heading">When is your exam?</h2>
            <p className="step-subtext">This helps us pace your review effectively</p>

            <div className="date-input-group">
              <label htmlFor="exam-date-input" className="date-label">Target Exam Date</label>
              <input
                id="exam-date-input"
                type="date"
                className="date-input"
                value={examDate}
                onChange={e => setExamDate(e.target.value)}
              />
              <button
                className="date-not-sure"
                onClick={() => {
                  setExamDate('');
                  setStep(3);
                }}
              >
                I'm not sure yet
              </button>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => setStep(3)}
            >
              Next →
            </Button>
          </div>
        )}

        {step === 3 && !isDiagnosticDone && (
          <div className="step-content">
            <h2 className="step-heading">Let's see where you stand</h2>
            <p className="step-subtext">Just 5 quick questions — no pressure, no score</p>

            {currentDiagQ ? (
              <div className="diagnostic-question-box">
                <div className="diag-meta">
                  <span className="diag-category-badge">
                    {CATEGORIES.find(c => c.id === currentDiagQ.category_id)?.name || 'General'}
                  </span>
                  <span className="diag-counter">
                    Question {currentDiagIndex + 1} of {diagnosticQuestions.length}
                  </span>
                </div>

                <p className="diag-question-text">
                  {currentDiagQ.question_text}
                </p>

                <div className="diag-options-list">
                  {currentDiagQ.options.map(opt => {
                    const isSelected = selectedOption === opt.key;
                    return (
                      <button
                        key={opt.key}
                        className={`diag-option-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleOptionClick(opt.key)}
                      >
                        <span className="option-badge">{opt.key}</span>
                        <span className="option-text">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="diag-loading">Loading diagnostic questions...</div>
            )}
          </div>
        )}

        {step === 3 && isDiagnosticDone && (
          <div className="step-content result-step">
            <div className="result-header">
              <span className="result-badge-icon">🎯</span>
              <h2 className="step-heading">Diagnostic Complete</h2>
            </div>

            <div className="supportive-copy-card">
              {score >= 4 && (
                <p>
                  Great foundation! You already have strong instincts. Let's sharpen them into exam-ready reflexes. 💪
                </p>
              )}
              {score >= 2 && score <= 3 && (
                <p>
                  Good start! You've got the building blocks. The areas we'll focus on are exactly where most examinees lose points — and where coaching makes the biggest difference. 📚
                </p>
              )}
              {score <= 1 && (
                <p>
                  That's exactly why you're here — and that's okay. The examinees who improve the most are the ones who start early and study smart, not just hard. Let's build your skills step by step. 🌱
                </p>
              )}
            </div>

            <div className="study-path-section">
              <h3>Here's your personalized study path:</h3>
              <div className="category-path-list">
                {CATEGORIES.map(cat => {
                  const qInCat = diagnosticQuestions.find(q => q.category_id === cat.id);
                  const isCorrect = qInCat && answers[qInCat.id] === qInCat.correct_option;
                  return (
                    <div key={cat.id} className="path-item">
                      <span className={`status-dot ${isCorrect ? 'strong' : 'focus'}`} />
                      <span className="path-icon">{cat.icon}</span>
                      <span className="path-name">{cat.name}</span>
                      <span className="path-status">{isCorrect ? 'Strong foundation' : 'Focus area'}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleCompleteOnboarding}
            >
              Let's Begin →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
