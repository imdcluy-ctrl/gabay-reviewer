import React, { useEffect, useState } from 'react';
import type { ScoreSummary } from '../../lib/scoring';
import { injectMockExamResultsToLeitner, type InjectionResult } from '../../lib/leitnerInjection';
import './ExamResultsSummary.css';

export interface ExamResultsSummaryProps {
  scoreSummary: ScoreSummary;
  mode: 'practice' | 'simulation';
  integrityFlag: 'none' | 'clock_anomaly';
  timeRemainingSeconds: number;
  attemptId: string;
  userId: string;
}

export const ExamResultsSummary: React.FC<ExamResultsSummaryProps> = ({
  scoreSummary,
  mode,
  integrityFlag,
  attemptId,
  userId,
}) => {
  const { score, totalQuestions, percentage, passed, passingThreshold, examType } = scoreSummary;
  const [injectionResult, setInjectionResult] = useState<InjectionResult | null>(null);

  useEffect(() => {
    async function runInjection() {
      if (!attemptId || !userId) return;
      const res = await injectMockExamResultsToLeitner(attemptId, userId);
      setInjectionResult(res);
    }
    runInjection();
  }, [attemptId, userId]);

  return (
    <div className="exam-results-summary-card">
      <div className="summary-header">
        <div className="summary-tags">
          <span className={`summary-tag mode-tag ${mode}`}>
            {mode === 'practice' ? 'Practice Mock' : 'Real CSC Simulation'}
          </span>
          <span className="summary-tag exam-type-tag">
            {examType === 'subprofessional' ? 'Sub-Professional' : 'Professional'}
          </span>
        </div>

        {/* L5: Post-exam Spaced Repetition Injection Toast */}
        {injectionResult && injectionResult.injected > 0 && (
          <div className="injection-toast-banner">
            🎯 <strong>{injectionResult.injected} mistakes injected into Spaced Review Queue:</strong> ({injectionResult.byType.conceptual || 0} conceptual, {injectionResult.byType.careless || 0} careless, {injectionResult.byType.timeout || 0} timeout). <a href="/review">Open Review Queue ➔</a>
          </div>
        )}

        {/* M2: Integrity Flag Warning Banner (INV-022) */}
        {integrityFlag === 'clock_anomaly' && (
          <div className="integrity-warning-banner" role="alert">
            ⚠️ <strong>Clock Anomaly Detected:</strong> System clock changes were detected during this attempt. Integrity flag logged.
          </div>
        )}
      </div>

      <div className={`hero-score-badge ${passed ? 'passed' : 'failed'}`}>
        <div className="score-main-display">
          <span className="hero-status-text">{passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}</span>
          <span className="hero-percentage">{percentage}%</span>
          <span className="hero-raw-score">
            {score} / {totalQuestions} Correct
          </span>
        </div>
      </div>

      <div className="threshold-callout">
        <span>Official CSC Passing Cutoff (80%): <strong>{passingThreshold} / {totalQuestions}</strong></span>
        <span className="cutoff-status">
          {passed ? '✅ Target Exceeded' : `⚠️ Short by ${passingThreshold - score} items`}
        </span>
      </div>

      {/* M2: §1.2 CSC Honesty Disclaimer */}
      <div className="summary-disclaimer">
        ℹ️ <strong>CSC Honesty Disclaimer:</strong> This web application is an independent, non-governmental self-assessment review tool designed for Philippine Civil Service Examination prep. It is not an officially proctored Civil Service Commission (CSC) exam.
      </div>
    </div>
  );
};
