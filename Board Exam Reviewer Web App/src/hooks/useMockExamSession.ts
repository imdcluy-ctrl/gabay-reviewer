import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../lib/db';
import type { LocalQuestion } from '../lib/db';
import type {
  MockExam,
  MockExamSection,
  MockExamAttempt,
  MockExamAnswer,
} from '../types/mockExam';

export type SessionState = 'initializing' | 'instructions' | 'answering' | 'paused' | 'submitting' | 'completed' | 'error';
import { selectMockExamQuestions } from '../lib/mockExamSelection';
import { MockExamPersistence } from '../lib/mockExamPersistence';
import { seedDatabase } from '../lib/seed';

export function useMockExamSession(
  examId: string,
  mode: 'practice' | 'simulation',
  localUserId: string
) {
  const [sessionState, setSessionState] = useState<SessionState>('initializing');
  const [exam, setExam] = useState<MockExam | null>(null);
  const [sections, setSections] = useState<MockExamSection[]>([]);
  const [attempt, setAttempt] = useState<MockExamAttempt | null>(null);
  const [questions, setQuestions] = useState<LocalQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answersMap, setAnswersMap] = useState<Map<number, MockExamAnswer>>(new Map());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showResumePrompt, setShowResumePrompt] = useState<boolean>(false);
  const [pendingAttempt, setPendingAttempt] = useState<MockExamAttempt | null>(null);

  // Active exam ID resolved from alias or attempt UUID
  const activeExamIdRef = useRef<string>('cse-professional-v1');

  // Resolve exam ID & ensure database seeding
  const initializeSession = useCallback(async () => {
    try {
      setSessionState('initializing');

      // Ensure question content is seeded in IndexedDB
      const questionCount = await db.questions.count();
      if (questionCount === 0) {
        console.log('Seeding initial question database...');
        await seedDatabase();
      }

      const { seedDefaultMockExams } = await import('../lib/migrations/v3_mock_exams');
      await seedDefaultMockExams(db);

      // Determine true mock_exam_id
      let targetExamId = examId;
      if (!targetExamId || targetExamId === 'full-simulation' || targetExamId === 'simulation' || targetExamId === 'mock-exam' || targetExamId === 'pro-170') {
        targetExamId = 'cse-professional-v1';
      } else if (targetExamId === 'subprofessional' || targetExamId === 'sub-165' || targetExamId === 'cse-subprofessional') {
        targetExamId = 'cse-subprofessional-v1';
      } else {
        // Check if examId is actually an attempt UUID
        const attemptRow = await db.mock_exam_attempts.get(examId);
        if (attemptRow) {
          targetExamId = attemptRow.mock_exam_id;
        }
      }

      activeExamIdRef.current = targetExamId;

      let examDef = await db.mock_exams.get(targetExamId);

      if (!examDef) {
        // Fallback to default professional exam if custom ID not found
        examDef = await db.mock_exams.get('cse-professional-v1');
      }

      if (!examDef) {
        setErrorMessage(`Mock Exam definition '${targetExamId}' not found.`);
        setSessionState('error');
        return;
      }

      setExam(examDef);
      const parsedSections: MockExamSection[] = JSON.parse(examDef.section_config || '[]');
      setSections(parsedSections);

      // Check for active resumable attempt (INV-016)
      const activeAttempt = await MockExamPersistence.loadResumableAttempt(localUserId, examDef.id);
      if (activeAttempt) {
        setPendingAttempt(activeAttempt);
        setShowResumePrompt(true);
        setSessionState('instructions');
        return;
      }

      setSessionState('instructions');
    } catch (err: any) {
      console.error('Error initializing mock exam session:', err);
      setErrorMessage(err.message || 'Failed to initialize mock exam session.');
      setSessionState('error');
    }
  }, [examId, localUserId]);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // Start fresh or resume existing attempt
  const startExam = async (shouldResume: boolean = false) => {
    try {
      setSessionState('initializing');
      setShowResumePrompt(false);

      let targetAttempt: MockExamAttempt;
      const targetExamId = activeExamIdRef.current || 'cse-professional-v1';

      if (shouldResume && pendingAttempt) {
        targetAttempt = pendingAttempt;
      } else {
        // Entitlement check
        const entitlement = await db.user_entitlements.get(localUserId);
        const userProfile = await db.user_profile.get(localUserId);
        const userEmail = (userProfile as any)?.email?.toLowerCase() || '';
        const isAdmin = userEmail === 'imdcluy@gmail.com' || userEmail === 'dpduaneluy@gmail.com';
        const isEntitled = isAdmin || entitlement?.is_premium === true || (!!entitlement && entitlement.plan_type !== 'free');

        // Enforce Free Tier 1 Simulation Quota
        if (mode === 'simulation' && !isEntitled) {
          const userSimulations = await db.mock_exam_attempts
            .where('local_user_id')
            .equals(localUserId)
            .toArray();
          const completedSimulations = userSimulations.filter(
            a => a.status === 'completed' && a.mode === 'simulation'
          ).length;

          if (completedSimulations >= 1) {
            setErrorMessage('FREE_TIER_SIMULATION_LIMIT_REACHED');
            setSessionState('error');
            return;
          }
        }

        const selectResult = await selectMockExamQuestions({
          examId: targetExamId,
          examType: exam?.exam_type || 'professional',
          sections: sections.length > 0 ? sections : JSON.parse(exam?.section_config || '[]'),
          localUserId,
          isEntitled,
          recentQuestionIds: [],
        });

        if (!selectResult.ok) {
          // Failsafe: if question selection pool is restricted, draw all available questions from db
          const fallbackQuestions = await db.questions.toArray();
          if (fallbackQuestions.length >= 10) {
            const shuffled = [...fallbackQuestions].sort(() => 0.5 - Math.random());
            const sampleQuestions = shuffled.slice(0, Math.min(170, shuffled.length));
            targetAttempt = await MockExamPersistence.createAttempt(
              localUserId,
              targetExamId,
              mode,
              sampleQuestions
            );
          } else {
            const msg = 'message' in selectResult ? selectResult.message : 'Insufficient questions to assemble exam.';
            setErrorMessage(msg);
            setSessionState('error');
            return;
          }
        } else {
          targetAttempt = await MockExamPersistence.createAttempt(
            localUserId,
            targetExamId,
            mode,
            selectResult.questions
          );
        }
      }

      setAttempt(targetAttempt);
      setCurrentIndex(targetAttempt.current_question_index || 0);

      // Load answer rows for this attempt
      const answerRows = await db.mock_exam_answers
        .where('attempt_id')
        .equals(targetAttempt.id)
        .toArray();

      // Sort answer rows by question_index ascending
      answerRows.sort((a, b) => a.question_index - b.question_index);

      const map = new Map<number, MockExamAnswer>();
      answerRows.forEach(a => map.set(a.question_index, a));
      setAnswersMap(map);

      // Load questions matching answer rows with content_snapshot fallback
      const allQuestionsList = await db.questions.toArray();
      const qMap = new Map(allQuestionsList.map(q => [q.id, q]));

      const orderedQuestions: LocalQuestion[] = answerRows.map(a => {
        const found = qMap.get(a.question_id);
        if (found) return found;

        // Fallback: build LocalQuestion from content_snapshot if question row is missing from db
        const snap = a.content_snapshot;
        if (!snap) return null;

        const parsedOptions = [
          { key: 'A', text: snap.options?.A || '' },
          { key: 'B', text: snap.options?.B || '' },
          { key: 'C', text: snap.options?.C || '' },
          { key: 'D', text: snap.options?.D || '' },
        ];

        return {
          id: a.question_id,
          category_id: snap.category_id || a.section_id || 'general-information',
          subtopic_id: snap.subtopic || 'general',
          subtopic: snap.subtopic || 'General',
          question_text: snap.question_text || 'Question',
          options: parsedOptions,
          correct_option: snap.correct_option || 'A',
          deconstruct_text: snap.deconstruction || snap.explanation || '',
          hint_ladder: (snap.hint_ladder || []).map((h: string, idx: number) => ({
            rung: idx + 1,
            title: `Hint ${idx + 1}`,
            text: h,
          })),
          choice_explanations: {},
          is_free: false,
          version: snap.content_version || 1,
        };
      }).filter((q): q is LocalQuestion => q !== null);

      if (orderedQuestions.length === 0) {
        // Failsafe: if attempt was corrupt, abandon it and auto-generate fresh questions
        await db.mock_exam_attempts.update(targetAttempt.id, { status: 'abandoned' });
        const allQ = await db.questions.toArray();
        if (allQ.length > 0) {
          const freshShuffled = [...allQ].sort(() => 0.5 - Math.random()).slice(0, Math.min(170, allQ.length));
          const freshAttempt = await MockExamPersistence.createAttempt(localUserId, targetExamId, mode, freshShuffled);
          const freshAnswerRows = await db.mock_exam_answers.where('attempt_id').equals(freshAttempt.id).toArray();
          freshAnswerRows.sort((a, b) => a.question_index - b.question_index);
          const freshMap = new Map<number, MockExamAnswer>();
          freshAnswerRows.forEach(a => freshMap.set(a.question_index, a));
          setAnswersMap(freshMap);
          setAttempt(freshAttempt);
          setQuestions(freshShuffled);
          setSessionState('answering');
          return;
        }
      }

      setQuestions(orderedQuestions);
      setSessionState('answering');
    } catch (err: any) {
      console.error('Error starting exam:', err);
      setErrorMessage(err.message || 'Error starting exam session.');
      setSessionState('error');
    }
  };

  // Actions
  const finalizeSubmission = async (status: 'completed' | 'auto_submitted' = 'completed') => {
    if (!attempt) return;

    let score = 0;
    answersMap.forEach(ans => {
      if (ans.is_correct) score++;
    });

    const total = questions.length || 170;
    const percentage = Math.round((score / total) * 100);
    const passingThreshold = exam?.exam_type === 'subprofessional' ? 132 : 136;
    const passed = score >= passingThreshold;

    await MockExamPersistence.finalizeAttempt(attempt.id, { score, percentage, passed }, status);
    setSessionState('completed');
  };

  const handleTimeout = useCallback(async () => {
    if (sessionState === 'completed' || sessionState === 'submitting') return;
    setSessionState('submitting');
    await finalizeSubmission('auto_submitted');
  }, [sessionState]);

  // Answer recording
  const recordAnswer = async (
    chosenOption: 'A' | 'B' | 'C' | 'D',
    timeSpentSecs: number
  ) => {
    if (!attempt || !questions[currentIndex]) return;
    const currentQ = questions[currentIndex];
    const isCorrect = chosenOption === currentQ.correct_option;

    const existingAns = answersMap.get(currentIndex);
    const updatedAns: MockExamAnswer = {
      id: existingAns?.id || `${attempt.id}_${currentIndex}`,
      attempt_id: attempt.id,
      question_id: currentQ.id,
      question_index: currentIndex,
      chosen_option: chosenOption,
      is_correct: isCorrect,
      time_spent_seconds: (existingAns?.time_spent_seconds || 0) + timeSpentSecs,
      flagged: existingAns?.flagged || false,
      section_id: currentQ.category_id,
      created_at: existingAns?.created_at || new Date().toISOString(),
      content_snapshot: existingAns?.content_snapshot || {
        question_text: currentQ.question_text,
        options: {
          A: currentQ.options.find(o => o.key === 'A')?.text || '',
          B: currentQ.options.find(o => o.key === 'B')?.text || '',
          C: currentQ.options.find(o => o.key === 'C')?.text || '',
          D: currentQ.options.find(o => o.key === 'D')?.text || '',
        },
        correct_option: currentQ.correct_option as any,
        explanation: currentQ.deconstruct_text,
        hint_ladder: currentQ.hint_ladder.map(h => `${h.title}: ${h.text}`),
        deconstruction: currentQ.deconstruct_text,
        trap_type: null,
        subtopic: currentQ.subtopic,
        category_id: currentQ.category_id,
        content_version: currentQ.version || 1,
      },
    };

    await db.mock_exam_answers.put(updatedAns);
    setAnswersMap(prev => new Map(prev).set(currentIndex, updatedAns));

    // Auto-advance
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      await db.mock_exam_attempts.update(attempt.id, { current_question_index: nextIdx });
    }
  };

  const toggleFlag = async (index: number) => {
    const existing = answersMap.get(index);
    if (!existing) return;
    const updated = { ...existing, flagged: !existing.flagged };
    await db.mock_exam_answers.put(updated);
    setAnswersMap(prev => new Map(prev).set(index, updated));
  };

  const goToQuestion = async (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
      if (attempt) {
        await db.mock_exam_attempts.update(attempt.id, { current_question_index: index });
      }
    }
  };

  const pauseSession = async () => {
    if (!attempt || mode === 'simulation') return;
    await db.mock_exam_attempts.update(attempt.id, { status: 'paused' });
    setSessionState('paused');
  };

  const resumeSession = async () => {
    if (!attempt) return;
    await db.mock_exam_attempts.update(attempt.id, { status: 'in_progress' });
    setSessionState('answering');
  };

  const [remainingSeconds, setRemainingSeconds] = useState<number>(11400);

  // Initialize timer from active attempt
  useEffect(() => {
    if (attempt) {
      setRemainingSeconds(attempt.time_remaining_seconds || 11400);
    }
  }, [attempt?.id]);

  // Ticking 1-second timer effect during 'answering' state
  useEffect(() => {
    if (sessionState !== 'answering' || !attempt) return;

    const timerInterval = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          handleTimeout();
          return 0;
        }
        const nextTime = prev - 1;
        if (nextTime % 10 === 0) {
          db.mock_exam_attempts.update(attempt.id, { time_remaining_seconds: nextTime });
        }
        return nextTime;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [sessionState, attempt?.id, handleTimeout]);

  const currentQuestion = questions[currentIndex] || null;
  const currentAnswer = answersMap.get(currentIndex) || null;

  const selectOption = (index: number, option: 'A' | 'B' | 'C' | 'D') => {
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
    return recordAnswer(option, 0);
  };
  const navigateNext = () => goToQuestion(currentIndex + 1);
  const navigatePrev = () => goToQuestion(currentIndex - 1);
  const jumpToIndex = (index: number) => goToQuestion(index);
  const abandonSession = async () => {
    if (attempt) {
      await db.mock_exam_attempts.update(attempt.id, { status: 'abandoned' });
    }
    setSessionState('instructions');
  };

  const getSubmitDetails = () => {
    let answered = 0;
    answersMap.forEach(a => {
      if (a.chosen_option) answered++;
    });
    return {
      totalQuestions: questions.length,
      answeredCount: answered,
      unansweredCount: Math.max(0, questions.length - answered),
      flaggedCount: Array.from(answersMap.values()).filter(a => a.flagged).length,
    };
  };

  return {
    sessionState,
    exam,
    sections,
    attempt,
    questions,
    currentIndex,
    currentQuestion,
    currentAnswer,
    answersMap,
    errorMessage,
    showResumePrompt,
    timer: { remainingSeconds },
    startExam,
    recordAnswer,
    selectOption,
    navigateNext,
    navigatePrev,
    jumpToIndex,
    getSubmitDetails,
    abandonSession,
    toggleFlag,
    goToQuestion,
    pauseSession,
    resumeSession,
    finalizeSubmission,
    handleTimeout,
  };
}
