import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../lib/db';
import type { MockExamAttempt, MockExamAnswer, MockExamSection } from '../types/mockExam';
import { calculateExamScore, generateSectionScores, generateSubtopicDiagnostics } from '../lib/scoring';
import { computePacingAnalysis } from '../lib/pacing';
import { calculateFatigueMetrics } from '../lib/fatigue';
import { canRetakeExam } from '../lib/retakeManager';

import { ExamResultsSummary } from '../components/exam/ExamResultsSummary';
import { SectionBreakdownChart } from '../components/exam/SectionBreakdownChart';
import { SubtopicRadarChart } from '../components/exam/SubtopicRadarChart';
import { PacingAnalysisPanel } from '../components/exam/PacingAnalysisPanel';
import { FatiguePanel } from '../components/exam/FatiguePanel';
import { ErrorDistributionWidget } from '../components/ErrorDistributionWidget';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import './MockExamResults.css';

export const MockExamResults: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [attempt, setAttempt] = useState<MockExamAttempt | null>(null);
  const [answers, setAnswers] = useState<MockExamAnswer[]>([]);
  const [sections, setSections] = useState<MockExamSection[]>([]);

  useEffect(() => {
    async function loadResults() {
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

        setAnswers(answerRows);

        const examDef = await db.mock_exams.get(attemptRow.mock_exam_id);
        if (examDef) {
          setSections(JSON.parse(examDef.section_config));
        }

        setIsLoading(false);
      } catch (err: any) {
        setErrorMessage(err.message || 'Error loading exam results.');
        setIsLoading(false);
      }
    }

    loadResults();
  }, [attemptId]);

  if (isLoading) {
    return (
      <div className="results-status-container">
        <div className="spinner" />
        <p>Calculating Performance Diagnostics...</p>
      </div>
    );
  }

  if (errorMessage || !attempt) {
    return (
      <div className="results-status-container">
        <Card className="error-card">
          <h2>⚠️ Unable to Load Results</h2>
          <p>{errorMessage}</p>
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  // Calculate snapshot diagnostics (INV-008, INV-019, INV-023, H1)
  const examType = attempt.mock_exam_id.includes('subprofessional') ? 'subprofessional' : 'professional';
  const scoreSummary = calculateExamScore(answers, examType);
  const sectionScores = generateSectionScores(answers, sections);
  const subtopicDiagnostics = generateSubtopicDiagnostics(answers);
  const pacingAnalysis = computePacingAnalysis(answers); // H1 Pacing
  const fatigueAnalysis = calculateFatigueMetrics(answers); // INV-023 Fatigue

  const lowestSubtopic = subtopicDiagnostics.length > 0
    ? [...subtopicDiagnostics].sort((a, b) => a.accuracy_ratio - b.accuracy_ratio)[0]
    : null;

  const handleRetakeExam = async () => {
    const cooldown = await canRetakeExam(attempt.local_user_id, attempt.mock_exam_id);
    if (cooldown.warning) {
      alert(cooldown.warning);
    }
    navigate(`/exam/${attempt.mock_exam_id}?mode=${attempt.mode}`);
  };

  return (
    <div className="mock-exam-results-layout">
      <header className="results-top-header">
        <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>
          ◀ Dashboard
        </Button>
        <h1>Performance Diagnostics Summary</h1>
      </header>

      <main className="results-content-grid">
        {/* 1. Hero Score Banner (INV-008, M2, L5) */}
        <ExamResultsSummary
          scoreSummary={scoreSummary}
          mode={attempt.mode}
          integrityFlag={attempt.integrity_flag}
          timeRemainingSeconds={attempt.time_remaining_seconds}
          attemptId={attempt.id}
          userId={attempt.local_user_id}
        />

        {/* 1b. 1-Click Targeted Practice Recommendation */}
        {lowestSubtopic && lowestSubtopic.is_weak && (
          <Card style={{ background: 'rgba(13, 115, 119, 0.08)', border: '1px solid var(--color-brand-teal)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ color: 'var(--color-brand-teal)', margin: 0, fontSize: '1rem' }}>🎯 Recommended Targeted Practice</h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
                  Your lowest accuracy was in <strong>{lowestSubtopic.subtopic.replace('-', ' ')}</strong> ({Math.round(lowestSubtopic.accuracy_ratio * 100)}%). Launch a 10-item drill to master it now.
                </p>
              </div>
              <Button variant="primary" size="md" onClick={() => navigate(`/study/${lowestSubtopic.category_id || 'verbal-ability'}`)}>
                Practice Weak Topic Now →
              </Button>
            </div>
          </Card>
        )}

        {/* 2. Section Accuracy & Timing (M3) */}
        <SectionBreakdownChart sections={sectionScores} />

        {/* 3. Subtopic Diagnostics Radar (L1) */}
        <SubtopicRadarChart diagnostics={subtopicDiagnostics} />

        {/* 4. Pacing Speed Analysis (H1) */}
        <PacingAnalysisPanel pacing={pacingAnalysis} />

        {/* 5. Cognitive Fatigue Analysis (INV-023) */}
        <FatiguePanel fatigue={fatigueAnalysis} />

        {/* 6. Metacognitive Error Breakdown (Phase 3.1, INV-026) */}
        <ErrorDistributionWidget
          attemptId={attempt.id}
          onOpenReview={() => navigate(`/exam/${attempt.id}/review`)}
        />

        {/* Action Controls */}
        <div className="results-actions-card">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate(`/exam/${attempt.id}/review`)}
          >
            Review Question Answers &amp; Explanations 📖
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={handleRetakeExam}
          >
            Retake Exam (Fresh Item Pool) 🔄
          </Button>
        </div>
      </main>
    </div>
  );
};

export default MockExamResults;
