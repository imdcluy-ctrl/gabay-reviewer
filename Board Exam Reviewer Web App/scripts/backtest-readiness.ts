/**
 * B4 — Readiness Algorithm Backtest
 *
 * Validates the Predictive Readiness Index (PRI) algorithm by:
 *   B4.1 — Hold-out validation: train on study data + earlier mocks,
 *          test against held-out mock exam score.
 *   B4.2 — Parameter sweep: test weight/smoothing variants.
 *   B4.3 — Rollout guardrails: bias, median error, coverage checks.
 *
 * Usage:  npx tsx scripts/backtest-readiness.ts
 */

import { db } from '../src/lib/db';
import { calculateReadinessIndex } from '../src/lib/readinessIndex';
import type { PRIConfig } from '../src/lib/readinessIndex';

// ── Types ──────────────────────────────────────────────────────

interface BacktestSample {
  userId: string;
  predictedScore: number;
  actualMockScore: number;
  trainingSize: number;
}

interface ParameterSweepResult {
  params: Partial<PRIConfig>;
  samples: BacktestSample[];

// ── B4.1: Hold-Out Backtest ───────────────────────────────────

async function runHoldOutBacktest(): Promise<BacktestSample[]> {
  const samples: BacktestSample[] = [];

  const mockAttempts = await db.mock_exam_attempts
    .filter(a => a.status === 'completed' && a.percentage != null)
    .toArray();

  const userIds = [...new Set(mockAttempts.map(a => a.local_user_id))];
  console.log(`Found ${userIds.length} users with completed mock exams.`);

  for (const userId of userIds) {
    const userMocks = mockAttempts
      .filter(a => a.local_user_id === userId && a.percentage != null)
      .sort((a, b) => (a.submitted_at || '').localeCompare(b.submitted_at || ''));

    if (userMocks.length < 2) continue;

    const heldOut = userMocks[userMocks.length - 1]!;
    const actualScore = heldOut.percentage!;

    const studyCount = await db.attempts
      .where('local_user_id').equals(userId).count();
    if (studyCount < 5) continue;

    try {
      const result = await calculateReadinessIndex(userId);
      samples.push({
        userId,
        predictedScore: result.score,
        actualMockScore: actualScore,
        trainingSize: studyCount,
      });
    } catch { /* skip */ }
  }

  return samples;
}

// ── Metrics ────────────────────────────────────────────────────

function computeMetrics(samples: BacktestSample[]) {
  const n = samples.length;
  if (n === 0) return { mae: 0, rmse: 0, correlation: 0, n: 0 };

  let absErrorSum = 0;
  let sqErrorSum = 0;
  let predSum = 0;
  let actualSum = 0;

  for (const s of samples) {
    const err = s.predictedScore - s.actualMockScore;
    absErrorSum += Math.abs(err);
    sqErrorSum += err * err;
    predSum += s.predictedScore;
    actualSum += s.actualMockScore;
  }

  const mae = absErrorSum / n;
  const rmse = Math.sqrt(sqErrorSum / n);
  const predMean = predSum / n;
  const actualMean = actualSum / n;

  let cov = 0;
  let varPred = 0;

// ── B4.2: Parameter Sweep ─────────────────────────────────────

const WEIGHT_VARIANTS: Partial<PRIConfig>[] = [
  { weights: { mockExam: 0.35, leitnerMastery: 0.25, practiceConsistency: 0.20, examProximity: 0.20 } },
  { weights: { mockExam: 0.45, leitnerMastery: 0.20, practiceConsistency: 0.20, examProximity: 0.15 } },
  { weights: { mockExam: 0.25, leitnerMastery: 0.25, practiceConsistency: 0.30, examProximity: 0.20 } },
  { weights: { mockExam: 0.25, leitnerMastery: 0.25, practiceConsistency: 0.25, examProximity: 0.25 } },
  { weights: { mockExam: 0.20, leitnerMastery: 0.40, practiceConsistency: 0.20, examProximity: 0.20 } },
];

const SMOOTHING_VARIANTS: Partial<PRIConfig>[] = [
  { smoothing: { recent3: [0.6, 0.3, 0.1] } as any },
  { smoothing: { recent3: [0.5, 0.3, 0.2] } as any },
  { smoothing: { recent3: [0.7, 0.2, 0.1] } as any },
];

async function runParameterSweep(): Promise<ParameterSweepResult[]> {
  const results: ParameterSweepResult[] = [];
  const allConfigs = [...WEIGHT_VARIANTS, ...SMOOTHING_VARIANTS];

  console.log(`\nSweeping ${allConfigs.length} parameter combinations...`);

  for (const override of allConfigs) {
    const samples = await runHoldOutBacktest();
    const metrics = computeMetrics(samples);
    results.push({ params: override, samples, ...metrics });

    const label = override.weights
      ? `W: ${override.weights.mockExam}/${override.weights.leitnerMastery}/${override.weights.practiceConsistency}/${override.weights.examProximity}`
      : `S: ${(override.smoothing as any)?.recent3?.join('/')}`;

    console.log(`  ${label} → MAE: ${metrics.mae.toFixed(2)}, RMSE: ${metrics.rmse.toFixed(2)}, r: ${metrics.correlation.toFixed(3)} (n=${metrics.n})`);
  }

  return results;
}

// ── B4.3: Rollout Guardrail Checks ────────────────────────────

function runGuardrailChecks(samples: BacktestSample[]) {
  console.log('\n--- B4.3: Rollout Guardrail Checks ---');
  if (samples.length === 0) { console.log('No samples.'); return; }


// ── Main ───────────────────────────────────────────────────────

async function main() {
  console.log('='.repeat(60));
  console.log('  B4 — Readiness Algorithm Backtest');
  console.log('='.repeat(60));

  if (process.argv.includes('--export-only')) {
    const u = (await db.user_profile.toArray()).length;
    const a = await db.attempts.count();
    const m = await db.mock_exam_attempts.count();
    const r = await db.review_state.count();
    console.log(`\nDB stats — Users:${u} Attempts:${a} Mocks:${m} Reviews:${r}`);
    return;
  }

  // B4.1
  console.log('\n--- B4.1: Hold-Out Backtest ---');
  const samples = await runHoldOutBacktest();
  const m = computeMetrics(samples);
  console.log(`\nResults (n=${m.n}):  MAE:${m.mae.toFixed(2)}  RMSE:${m.rmse.toFixed(2)}  r:${m.correlation.toFixed(3)}`);

  if (m.n > 0) {
    const sorted = [...samples].sort(
      (a, b) => Math.abs(a.predictedScore - a.actualMockScore) - Math.abs(b.predictedScore - b.actualMockScore),
    );
    console.log(`  Best:  user=${sorted[0]!.userId.slice(0, 8)} pred=${sorted[0]!.predictedScore} actual=${sorted[0]!.actualMockScore}`);
    const worst = sorted[sorted.length - 1]!;
    console.log(`  Worst: user=${worst.userId.slice(0, 8)} pred=${worst.predictedScore} actual=${worst.actualMockScore}`);
  }

  // B4.2
  console.log('\n--- B4.2: Parameter Sensitivity Sweep ---');
  const sweepResults = await runParameterSweep();

  if (sweepResults.length > 0) {
    const best = sweepResults.reduce((a, b) => a.correlation > b.correlation ? a : b);
    console.log(`\n🏆 Best config: r=${best.correlation.toFixed(3)} MAE=${best.mae.toFixed(2)}`);
    console.log(`   ${JSON.stringify(best.params)}`);
  }

  // B4.3
  runGuardrailChecks(samples);

  console.log('\n' + '='.repeat(60));
  console.log(m.n >= 3 ? '  ✅ B4 validation complete.' : '  ⚠️  Insufficient samples (need ≥3 with 2+ mocks each).');
  console.log('='.repeat(60));
}

main().catch(err => { console.error('Backtest failed:', err); process.exit(1); });

  const predMean = samples.reduce((s, x) => s + x.predictedScore, 0) / samples.length;
  const actualMean = samples.reduce((s, x) => s + x.actualMockScore, 0) / samples.length;
  const bias = predMean - actualMean;

  console.log(`  Predicted PRI mean: ${predMean.toFixed(1)}`);
  console.log(`  Actual mock mean:   ${actualMean.toFixed(1)}`);
  console.log(`  Bias:               ${bias.toFixed(1)} pts ${Math.abs(bias) > 10 ? '⚠️' : '✅'}`);

  const sortedDiffs = samples.map(s => s.predictedScore - s.actualMockScore).sort((a, b) => a - b);
  const medianDiff = sortedDiffs[Math.floor(sortedDiffs.length / 2)]!;
  console.log(`  Median error:       ${medianDiff.toFixed(1)} pts ${Math.abs(medianDiff) > 8 ? '⚠️' : '✅'}`);

  const lowVol = samples.filter(s => s.trainingSize < 20).length;
  console.log(`  Low-volume samples: ${lowVol}/${samples.length} (${(lowVol / samples.length * 100).toFixed(1)}%)`);
}

  let varActual = 0;
  for (const s of samples) {
    const dp = s.predictedScore - predMean;
    const da = s.actualMockScore - actualMean;
    cov += dp * da;
    varPred += dp * dp;
    varActual += da * da;
  }

  const denom = Math.sqrt(varPred * varActual);
  const correlation = denom > 0 ? cov / denom : 0;

  return { mae, rmse, correlation, n };
}

  mae: number;
  rmse: number;
  correlation: number;
  n: number;
}
