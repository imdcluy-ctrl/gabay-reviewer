import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useStudySession } from '../hooks/useStudySession';
import { CATEGORIES } from '../lib/constants';
import { Header } from '../components/Header';
import { CategoryPrimer } from '../components/CategoryPrimer';
import { QuestionView } from '../components/QuestionView';
import { HintLadder } from '../components/HintLadder';
import { ConfidenceCheck } from '../components/ConfidenceCheck';
import { ErrorSelfDiagnosis } from '../components/ErrorSelfDiagnosis';
import { ResultFeedback } from '../components/ResultFeedback';
import { DeconstructionCard } from '../components/DeconstructionCard';
import { JournalInput } from '../components/JournalInput';
import { BreakSuggestion } from '../components/BreakSuggestion';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { BackupNudge } from '../components/BackupNudge';
import { OfflineBanner } from '../components/OfflineBanner';
import { useUserProfile } from '../hooks/useUserProfile';
import { SoundToggle } from '../components/SoundToggle';
import { useSound } from '../hooks/useSound';
import './StudySession.css';

export const StudySession: React.FC = () => {
  const { categoryId = 'numerical-ability' } = useParams<{ categoryId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const userId = profile?.id || 'guest';

  const searchParams = new URLSearchParams(location.search);
  const sessionType = searchParams.get('session') === 'review' ? 'review' : 'practice';

  const categoryObj = CATEGORIES.find(c => c.id === categoryId);

  // Primer check (only for practice sessions)
  const [showPrimer, setShowPrimer] = useState<boolean>(false);

  useEffect(() => {
    if (sessionType !== 'review') {
      const hasSeen = localStorage.getItem(`primer_seen_${categoryId}`);
      if (!hasSeen) {
        setShowPrimer(true);
      }
    }
  }, [categoryId, sessionType]);

  const {
    state,
    currentQuestion,
    isForcedDeconstruction,
    selectedOption,
    confidenceRating,
    hintsUsedCount,
    elapsedSeconds,
    questionsAnswered,
    sessionMinutes,
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


  } = useStudySession(categoryId, sessionType);

  // Sound effects for study session
  const sound = useSound();
  React.useEffect(() => {
    if (state === 'result' && currentQuestion) {
      if (selectedOption === currentQuestion.correct_option) {
        sound.play('correct');
      } else {
        sound.play('wrong');
      }
    }
    if (state === 'complete') {
      sound.play('complete');
    }
  }, [state]);

  if (showPrimer) {
    return (
      <CategoryPrimer
        categoryId={categoryId}
        onDismiss={() => setShowPrimer(false)}
      />
    );
  }

  return (
    <div className="study-layout page-wrapper">
      <OfflineBanner />
      <Header
        title={sessionType === 'review' ? 'Spaced Review Session' : (categoryObj?.name || 'Practice Session')}
        showBack
        onBack={() => navigate(-1)}
        rightAction={<SoundToggle />}
      />

      <main className="study-main-content">
        {state === 'loading' && (
          <div className="study-loading-box">
            <p>Selecting next question...</p>
          </div>
        )}

        {state === 'complete' && (
          <Card className="session-complete-card">
            <span className="complete-icon">🎉</span>
            <h2>Session Complete!</h2>
            <p>You answered {questionsAnswered} questions in {sessionMinutes} minutes.</p>
            <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/dashboard')}>
              Back to Dashboard →
            </Button>
          </Card>
        )}

        {/* Forced Deconstruction State Branch (§2.4 Leech Remedial Intervention) */}
        {isForcedDeconstruction && currentQuestion && (
          <div className="forced-deconstruct-wrapper">
            <div className="leech-alert-banner">
              ⚠️ <strong>Priority Leech Card Remediation:</strong> You previously answered this item with high confidence but got it incorrect. Re-read the worked solution below before re-testing!
            </div>
            <DeconstructionCard question={currentQuestion} />
            <Button
              variant="primary"
              size="lg"
              fullWidth
              style={{ marginTop: '1rem' }}
              onClick={handleProceedFromForcedDeconstruction}
            >
              Proceed to Test Question →
            </Button>
          </div>
        )}

        {/* Standard Question Loop */}
        {!isForcedDeconstruction && currentQuestion && state !== 'complete' && state !== 'loading' && (
          <>
            {(state === 'answering' || state === 'hinting') && (
              <QuestionView
                question={currentQuestion}
                selectedOption={selectedOption}
                onSelectOption={handleSelectOption}
                onSubmit={handleSubmitAnswer}
                onRequestHint={handleRequestHint}
                elapsedSeconds={elapsedSeconds}
              >
                {state === 'hinting' && (
                  <HintLadder
                    hintLadder={currentQuestion.hint_ladder}
                    onSkipToAnswer={handleSkipToAnswer}
                    onHintUsed={rung => setHintsUsedCount(rung)}
                  />
                )}
              </QuestionView>
            )}

            {state === 'confidence' && (
              <ConfidenceCheck onSelectConfidence={handleSelectConfidence} />
            )}

            {state === 'result' && (
              <>
                {selectedOption !== currentQuestion.correct_option && (
                  <ErrorSelfDiagnosis
                    questionId={currentQuestion.id}
                    userId={userId}
                    onDiagnosed={() => {}}
                  />
                )}
                <ResultFeedback
                  isCorrect={selectedOption === currentQuestion.correct_option}
                  selectedOption={selectedOption || ''}
                  correctOption={currentQuestion.correct_option}
                  question={currentQuestion}
                  confidenceRating={confidenceRating}
                  onSeeExplanation={handleSeeExplanation}
                />
              </>
            )}

            {state === 'deconstruction' && (
              <DeconstructionCard question={currentQuestion} />
            )}

            {(state === 'result' || state === 'deconstruction') && (
              <>
                <JournalInput
                  questionId={currentQuestion.id}
                  onNextQuestion={handleResolveQuestion}
                />
                <BackupNudge
                  hintsUsedCount={hintsUsedCount}
                  isCorrect={selectedOption === currentQuestion.correct_option}
                />
              </>
            )}
          </>
        )}
      </main>

      {showBreakOverlay && (
        <BreakSuggestion
          questionsAnswered={questionsAnswered}
          minutesElapsed={sessionMinutes}
          onTakeBreak={() => navigate('/dashboard')}
          onKeepGoing={handleKeepGoingFromBreak}
        />
      )}
    </div>
  );
};




