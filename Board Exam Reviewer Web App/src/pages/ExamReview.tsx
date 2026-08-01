import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, type LocalQuestion } from '../lib/db';
import type { MockExamAttempt, MockExamAnswer } from '../types/mockExam';
import { QuestionPalette } from '../components/exam/QuestionPalette';
import { HintLadder } from '../components/HintLadder';
import { DeconstructionCard } from '../components/DeconstructionCard';
import { JournalInput } from '../components/JournalInput';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { classifyErrorType } from '../lib/leitnerInjection';
import { ErrorTagSelector } from '../components/ErrorTagSelector';
import './ExamReview.css';

export type ReviewFilter = 'all' | 'incorrect' | 'flagged' | 'careless' | 'conceptual';

export const ExamReview: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [attempt, setAttempt] = useState<MockExamAttempt | null>(null);
  const [answers, setAnswers] = useState<MockExamAnswer[]>([]);
  const [answersMap, setAnswersMap] = useState<Map<number, MockExamAnswer>>(new Map());
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<ReviewFilter>('all');

  useEffect(() => {
    async function loadReviewData() {
      if (!attemptId) return;

      try {
        setIsLoading(true);

        const attemptRow = await db.mock_exam_attempts.get(attemptId);
        if (!attemptRow) {
          setErrorMessage(`Mock Exam attempt '${attemptId}' not found.`);
          setIsLoading(false);
          return;
        }

        setAttempt(attemptRow);

        const answerRows = await db.mock_exam_answers
          .where('attempt_id')
          .equals(attemptId)
          .toArray();

        // Sort by question_index
        answerRows.sort((a, b) => a.question_index - b.question_index);
        setAnswers(answerRows);

        const map = new Map<number, MockExamAnswer>();
        answerRows.forEach(a => map.set(a.question_index, a));
        setAnswersMap(map);

        setIsLoading(false);
      } catch (err: any) {
        setErrorMessage(err.message || 'Error loading exam review data.');
        setIsLoading(false);
      }
    }

    loadReviewData();
  }, [attemptId]);

  const currentAnswer = answers[currentIndex] || null;

  // Filter items
  const filteredIndices = answers.map((ans, idx) => {
    if (activeFilter === 'all') return idx;
    if (activeFilter === 'incorrect' && !ans.is_correct) return idx;
    if (activeFilter === 'flagged' && ans.flagged) return idx;
    if (activeFilter === 'careless' && classifyErrorType(ans) === 'careless') return idx;
    if (activeFilter === 'conceptual' && classifyErrorType(ans) === 'conceptual') return idx;
    return -1;
  }).filter(idx => idx !== -1);

  const handleSaveJournalNote = async (noteText: string, promptUsed: string) => {
    if (!currentAnswer || !attempt) return;

    // M3 Persistence Target: Write to existing journal_entries table with source metadata
    const nowIso = new Date().toISOString();
    await db.journal_entries.add({
      id: `review_note_${attempt.id}_${currentAnswer.question_id}_${Date.now()}`,
      local_user_id: attempt.local_user_id,
      question_id: currentAnswer.question_id,
      note_text: noteText,
      prompt_used: promptUsed || 'Mock Exam Review Explanation',
      created_at: nowIso,
      synced_at: null,
    });
  };

  if (isLoading) {
    return (
      <div className="review-status-container">
        <div className="spinner" />
        <p>Loading Exam Socratic Review Card...</p>
      </div>
    );
  }

  if (errorMessage || !attempt || answers.length === 0) {
    return (
      <div className="review-status-container">
        <Card className="error-card">
          <h2>⚠️ Unable to Load Review</h2>
          <p>{errorMessage}</p>
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const snapshot = currentAnswer?.content_snapshot;

  // Construct mock LocalQuestion for DeconstructionCard (INV-019)
  const mockQuestion: LocalQuestion | null = snapshot ? {
    id: currentAnswer.question_id,
    category_id: snapshot.category_id,
    subtopic: snapshot.subtopic || 'General',
    difficulty: 3,
    is_free: true,
    blueprint_id: `CSE-${snapshot.category_id.toUpperCase()}`,
    question_text: snapshot.question_text,
    options: Object.entries(snapshot.options).map(([k, v]) => ({ key: k, text: v })),
    correct_option: snapshot.correct_option,
    hint_ladder: snapshot.hint_ladder.map((h, i) => ({ rung: i + 1, title: `Hint ${i + 1}`, text: h })),
    deconstruct_text: snapshot.deconstruction,
    choice_explanations: {
      [snapshot.correct_option]: { text: snapshot.explanation, trap_type: snapshot.trap_type },
    },
    next_time_rule: 'Review carefully before confirming choices under time pressure.',
    status: 'published',
    version: snapshot.content_version,
  } : null;

  return (
    <div className="exam-review-layout">
      {/* Sticky Header */}
      <header className="review-sticky-header">
        <div className="review-header-left">
          <Button variant="secondary" size="sm" onClick={() => navigate(`/exam/${attempt.id}/results`)}>
            ◀ Back to Diagnostics
          </Button>
          <h1>Post-Exam Socratic Review Card</h1>
        </div>

        <div className="review-filters">
          <button
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All ({answers.length})
          </button>
          <button
            className={`filter-btn ${activeFilter === 'incorrect' ? 'active' : ''}`}
            onClick={() => setActiveFilter('incorrect')}
          >
            Incorrect ({answers.filter(a => !a.is_correct).length})
          </button>
          <button
            className={`filter-btn ${activeFilter === 'flagged' ? 'active' : ''}`}
            onClick={() => setActiveFilter('flagged')}
          >
            Flagged ({answers.filter(a => a.flagged).length})
          </button>
          <button
            className={`filter-btn ${activeFilter === 'careless' ? 'active' : ''}`}
            onClick={() => setActiveFilter('careless')}
          >
            Careless ({answers.filter(a => classifyErrorType(a) === 'careless').length})
          </button>
          <button
            className={`filter-btn ${activeFilter === 'conceptual' ? 'active' : ''}`}
            onClick={() => setActiveFilter('conceptual')}
          >
            Conceptual ({answers.filter(a => classifyErrorType(a) === 'conceptual').length})
          </button>
        </div>
      </header>

      <div className="review-body-grid">
        <main className="review-main-content">
          {snapshot && currentAnswer && mockQuestion && (
            <Card className="review-card">
              <div className="review-card-header">
                <span className="q-index-badge">Item {currentIndex + 1} of {answers.length} (Filter: {filteredIndices.length} items)</span>
                <span className={`result-tag ${currentAnswer.is_correct ? 'correct' : 'incorrect'}`}>
                  {currentAnswer.is_correct ? '✓ CORRECT' : '✗ INCORRECT'}
                </span>
                <span className="pacing-tag">{currentAnswer.time_spent_seconds}s spent</span>
              </div>

              {/* Stem sourced exclusively from content_snapshot (INV-019) */}
              <p className="review-stem-text">{snapshot.question_text}</p>

              {/* Options display with chosen vs correct highlight */}
              <div className="review-options-list">
                {(['A', 'B', 'C', 'D'] as const).map(key => {
                  const optText = snapshot.options[key];
                  const isChosen = currentAnswer.chosen_option === key;
                  const isCorrect = snapshot.correct_option === key;

                  let optionClass = 'review-option-item';
                  if (isCorrect) optionClass += ' correct-target';
                  if (isChosen && !isCorrect) optionClass += ' chosen-wrong';

                  return (
                    <div key={key} className={optionClass}>
                      <span className="key-badge">{key}</span>
                      <span className="text-body">{optText}</span>
                      {isCorrect && <span className="mark-badge correct">✓ Correct Answer</span>}
                      {isChosen && !isCorrect && <span className="mark-badge wrong">✗ Your Choice</span>}
                    </div>
                  );
                })}
              </div>

              {/* 5-Layer Socratic Pedagogy Components */}
              <div className="socratic-review-layers">
                <h3>Socratic Pedagogy Breakdown</h3>

                {/* Layer 1: Hint Ladder */}
                {mockQuestion.hint_ladder && mockQuestion.hint_ladder.length > 0 && (
                  <HintLadder
                    hintLadder={mockQuestion.hint_ladder}
                    onSkipToAnswer={() => {}}
                  />
                )}

                {/* Layer 2: Worked Deconstruction Card */}
                <DeconstructionCard question={mockQuestion} />

                {/* Phase 3.1: Metacognitive Error Tag Selector (INV-026) */}
                <ErrorTagSelector
                  localUserId={attempt.local_user_id}
                  questionId={currentAnswer.question_id}
                  isIncorrect={!currentAnswer.is_correct}
                  attemptId={attempt.id}
                  source="mock_exam"
                  timeSpentSeconds={currentAnswer.time_spent_seconds}
                  machineErrorClass={classifyErrorType(currentAnswer)}
                />

                {/* Step 3: Journaling */}
                <div className="review-journal-section">
                  <JournalInput
                    questionId={currentAnswer.question_id}
                    onNextQuestion={handleSaveJournalNote}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Review Navigation */}
          <div className="review-nav-bar">
            <Button
              variant="secondary"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(currentIndex - 1)}
            >
              ◀ Previous
            </Button>

            <Button
              variant="primary"
              disabled={currentIndex === answers.length - 1}
              onClick={() => setCurrentIndex(currentIndex + 1)}
            >
              Next Item ▶
            </Button>
          </div>
        </main>

        {/* Palette Drawer in Review Mode (M4) */}
        <aside className="review-palette-aside">
          <h3>Review Question Palette</h3>
          <QuestionPalette
            totalQuestions={answers.length}
            currentIndex={currentIndex}
            answersMap={answersMap}
            onSelectIndex={setCurrentIndex}
            mode="review"
          />
        </aside>
      </div>
    </div>
  );
};

export default ExamReview;
