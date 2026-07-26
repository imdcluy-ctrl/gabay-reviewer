import { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../lib/db';
import type { LocalQuestion, LocalAttempt, LocalJournalEntry, LocalReviewState } from '../lib/db';
import { getNextQuestion } from '../lib/questionSelection';
import { rateLeitnerCard } from '../lib/leitner';
import { useUserProfile } from './useUserProfile';
import { analytics } from '../lib/analytics';
import { EVENTS } from '../lib/events';

export type SessionState =
  | 'loading'
  | 'answering'
  | 'hinting'
  | 'confidence'
  | 'result'
  | 'deconstruction'
  | 'journal'
  | 'break'
  | 'complete';

export function useStudySession(categoryId: string, sessionType: 'practice' | 'review' = 'practice') {
  const { profile } = useUserProfile();

  const [state, setState] = useState<SessionState>('loading');
  const [currentQuestion, setCurrentQuestion] = useState<LocalQuestion | null>(null);
  const [currentReviewState, setCurrentReviewState] = useState<LocalReviewState | null>(null);
  const [isForcedDeconstruction, setIsForcedDeconstruction] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [confidenceRating, setConfidenceRating] = useState<number>(2); // Default 'Maybe'
  const [hintsUsedCount, setHintsUsedCount] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Session counters
  const [questionsAnswered, setQuestionsAnswered] = useState<number>(0);
  const [sessionStartTime] = useState<number>(Date.now());
  const [showBreakOverlay, setShowBreakOverlay] = useState<boolean>(false);

  // Timer ref
  const timerRef = useRef<number | null>(null);

  // Load next question
  const loadNextQuestion = useCallback(async () => {
    if (!profile) return;
    setState('loading');
    setSelectedOption(null);
    setConfidenceRating(2);
    setHintsUsedCount(0);
    setElapsedSeconds(0);
    setIsForcedDeconstruction(false);

    try {
      const nextQ = await getNextQuestion(categoryId, profile.id, sessionType);
      if (!nextQ) {
        if (sessionType === 'review') {
          analytics.track(EVENTS.REVIEW_SESSION_COMPLETED, {
            reviewed: questionsAnswered,
            remaining_due: 0,
          });
        }
        setState('complete');
      } else {
        setCurrentQuestion(nextQ);

        // Check if current question is a leech card (§2.4 forced deconstruction branch)
        const compositeId = `${profile.id}_${nextQ.id}`;
        const rs = await db.review_state.get(compositeId);
        setCurrentReviewState(rs || null);

        if (rs && rs.is_leech && sessionType === 'review') {
          setIsForcedDeconstruction(true);
          setState('deconstruction'); // Force student to re-read worked solution first!
        } else {
          setState('answering');
        }
      }
    } catch (error) {
      console.error('Error loading next question:', error);
      setState('complete');
    }
  }, [categoryId, profile?.id, sessionType, questionsAnswered]);

  useEffect(() => {
    if (profile?.id) {
      if (sessionType === 'review') {
        analytics.track(EVENTS.REVIEW_SESSION_STARTED, {
          session_type: 'review',
          category_id: categoryId,
        });
      }
      loadNextQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, profile?.id, sessionType, loadNextQuestion]);

  // Per-question Timer effect
  useEffect(() => {
    const isTimerActive = state === 'answering' || state === 'hinting';

    if (isTimerActive) {
      timerRef.current = window.setInterval(() => {
        if (document.visibilityState === 'visible') {
          setElapsedSeconds(prev => prev + 1);
        }
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state]);

  // Actions
  const handleSelectOption = (optionKey: string) => {
    setSelectedOption(optionKey);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption) return;
    setState('confidence');
  };

  const handleRequestHint = () => {
    setState('hinting');
    if (hintsUsedCount === 0) setHintsUsedCount(1);
  };

  const handleSelectConfidence = (rating: number) => {
    setConfidenceRating(rating);
    setState('result');
  };

  const handleSeeExplanation = () => {
    setState('deconstruction');
  };

  const handleProceedFromForcedDeconstruction = () => {
    setIsForcedDeconstruction(false);
    setState('answering');
  };

  const handleSkipToAnswer = () => {
    setSelectedOption(null);
    setHintsUsedCount(4); // All hints used
    setState('deconstruction');
  };

  // Complete question & save attempt/journal & rate Leitner card (§4.4 INVARIANT)
  const handleResolveQuestion = async (noteText: string, promptUsed: string) => {
    if (!profile || !currentQuestion) return;

    try {
      const isCorrect = selectedOption === currentQuestion.correct_option;
      const nowIso = new Date().toISOString();

      const attemptRecord: LocalAttempt = {
        id: uuidv4(),
        local_user_id: profile.id,
        question_id: currentQuestion.id,
        chosen_option: selectedOption || '',
        is_correct: isCorrect,
        confidence_rating: confidenceRating,
        hints_used_count: hintsUsedCount,
        time_spent_seconds: elapsedSeconds,
        session_type: sessionType,
        attempted_at: nowIso,
        synced_at: null,
      };

      await db.attempts.add(attemptRecord);
      console.log('[Gabay] Attempt saved:', attemptRecord.id, 'for question:', currentQuestion.id);

      // Rate Leitner Card (§2.1 & §4.4 Create-if-absent rule)
      await rateLeitnerCard({
        localUserId: profile.id,
        questionId: currentQuestion.id,
        isCorrect,
        confidenceRating,
        hintsUsedCount,
        sessionType,
        examDate: profile.exam_date,
        nowIso,
      });

      if (noteText.trim()) {
        const journalRecord: LocalJournalEntry = {
          id: uuidv4(),
          local_user_id: profile.id,
          question_id: currentQuestion.id,
          note_text: noteText.trim(),
          prompt_used: promptUsed,
          created_at: nowIso,
          synced_at: null,
        };
        await db.journal_entries.add(journalRecord);
      }

      const newAnsweredCount = questionsAnswered + 1;
      setQuestionsAnswered(newAnsweredCount);

      const minutesElapsed = Math.floor((Date.now() - sessionStartTime) / 60000);

      // Check break threshold (20 Qs or 25 mins)
      if (newAnsweredCount > 0 && (newAnsweredCount % 20 === 0 || minutesElapsed >= 25)) {
        setShowBreakOverlay(true);
      } else {
        await loadNextQuestion();
      }
    } catch (error) {
      console.error('[Gabay] Error saving attempt:', error);
      // Still try to proceed to next question even if save failed
      await loadNextQuestion();
    }
  };

  const handleKeepGoingFromBreak = async () => {
    setShowBreakOverlay(false);
    await loadNextQuestion();
  };

  return {
    state,
    currentQuestion,
    currentReviewState,
    isForcedDeconstruction,
    selectedOption,
    confidenceRating,
    hintsUsedCount,
    elapsedSeconds,
    questionsAnswered,
    sessionMinutes: Math.floor((Date.now() - sessionStartTime) / 60000),
    showBreakOverlay,
    handleSelectOption,
    handleSubmitAnswer,
    handleRequestHint,
    setHintsUsedCount,
    handleSelectConfidence,
    handleSeeExplanation,
    handleProceedFromForcedDeconstruction,
    handleSkipToAnswer,
    handleResolveQuestion,
    handleKeepGoingFromBreak,
  };
}
