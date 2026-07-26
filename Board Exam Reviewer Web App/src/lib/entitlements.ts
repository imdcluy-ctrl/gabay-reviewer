// Entitlement & Paywall Engine (§3.4, INV-029)

import { db, type UserEntitlementRecord } from './db';
import type { LocalQuestion } from './db';
import type { MockExamAttempt } from '../types/mockExam';

export interface QuotaStatus {
  allowed: boolean;
  used: number;
  max: number;
  isUnlimited: boolean;
}

export const FREE_TIER_LIMITS = {
  MAX_SIMULATION_ATTEMPTS: 1,
  MAX_DAILY_PRACTICE_SESSIONS: 3,
};


/**
 * Gets or creates the default entitlement record for a user.
 */
export async function getUserEntitlement(localUserId: string): Promise<UserEntitlementRecord> {
  const existing = await db.user_entitlements.get(localUserId);
  if (existing) {
    return existing;
  }

  const defaultRecord: UserEntitlementRecord = {
    id: localUserId,
    local_user_id: localUserId,
    plan_type: 'free',
    is_premium: false,
    updated_at: Date.now(),
  };

  await db.user_entitlements.put(defaultRecord);
  return defaultRecord;
}

/**
 * INV-029a/b: Checks full simulation mock attempt quota.
 * Free tier: max 1 completed simulation mock.
 * Premium tier: unlimited.
 */
export async function checkSimulationQuota(
  localUserId: string,
  mockAttempts: MockExamAttempt[]
): Promise<QuotaStatus> {
  const entitlement = await getUserEntitlement(localUserId);

  if (entitlement.is_premium || entitlement.plan_type !== 'free') {
    return { allowed: true, used: 0, max: Infinity, isUnlimited: true };
  }

  const completedSimulations = mockAttempts.filter(
    a => a.status === 'completed' && a.mode === 'simulation'
  ).length;

  const max = FREE_TIER_LIMITS.MAX_SIMULATION_ATTEMPTS;
  const allowed = completedSimulations < max;

  return {
    allowed,
    used: completedSimulations,
    max,
    isUnlimited: false,
  };
}

/**
 * INV-029a/b: Checks daily practice session quota per category.
 * Free tier: max 3 sessions per day.
 * Premium tier: unlimited.
 */
export async function checkPracticeQuota(
  localUserId: string,
  practiceAttempts: { attempted_at: string }[]
): Promise<QuotaStatus> {
  const entitlement = await getUserEntitlement(localUserId);

  if (entitlement.is_premium || entitlement.plan_type !== 'free') {
    return { allowed: true, used: 0, max: Infinity, isUnlimited: true };
  }

  const todayStr = new Date().toISOString().split('T')[0] || '';
  const todaySessions = practiceAttempts.filter(a => a.attempted_at.startsWith(todayStr)).length;

  const max = FREE_TIER_LIMITS.MAX_DAILY_PRACTICE_SESSIONS;
  const allowed = todaySessions < max;

  return {
    allowed,
    used: todaySessions,
    max,
    isUnlimited: false,
  };
}

/**
 * INV-029a: Filters question bank based on entitlement.
 * Free users access only `is_free === true` (or missing/undefined). Premium users access 100%.
 */
export function filterQuestionsForUser(
  questions: LocalQuestion[],
  isPremium: boolean
): LocalQuestion[] {
  if (isPremium) return questions;

  return questions.filter(q => q.is_free === undefined || q.is_free === true);
}


/**
 * Grants premium access via simulated payment (e.g. GCash / Maya / PayMongo).
 */
export async function upgradeToPremium(
  localUserId: string,
  paymentMethod: 'gcash' | 'maya' | 'card' = 'gcash'
): Promise<UserEntitlementRecord> {
  const record: UserEntitlementRecord = {
    id: localUserId,
    local_user_id: localUserId,
    plan_type: 'pro',
    is_premium: true,
    payment_method: paymentMethod,
    updated_at: Date.now(),
  };

  await db.user_entitlements.put(record);
  return record;
}
