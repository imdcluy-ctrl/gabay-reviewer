import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { useUserProfile } from './useUserProfile';
import {
  checkSimulationQuota,
  checkPracticeQuota,
  upgradeToPremium as upgradeToPremiumApi,
  type QuotaStatus,
} from '../lib/entitlements';

const ADMIN_EMAILS = ['imdcluy@gmail.com', 'dpduaneluy@gmail.com'];

export function useEntitlement() {
  const { profile } = useUserProfile();
  const userId = profile?.id || 'guest';
  const userEmail = (profile as any)?.email?.toLowerCase() || (profile as any)?.display_name?.toLowerCase() || '';

  const isAdmin = ADMIN_EMAILS.includes(userEmail);

  const entitlementRecord = useLiveQuery(
    () => db.user_entitlements.get(userId),
    [userId]
  );

  useEffect(() => {
    if (isAdmin && userId && userId !== 'guest') {
      db.user_entitlements.put({
        id: userId,
        local_user_id: userId,
        plan_type: 'pro',
        is_premium: true,
        updated_at: Date.now(),
      }).catch(console.error);
    }
  }, [isAdmin, userId]);

  const mockAttempts = useLiveQuery(
    () => db.mock_exam_attempts.where('local_user_id').equals(userId).toArray(),
    [userId]
  ) || [];

  const practiceAttempts = useLiveQuery(
    () => db.attempts.where('local_user_id').equals(userId).toArray(),
    [userId]
  ) || [];

  let isPremium = isAdmin || entitlementRecord?.is_premium === true || (!!entitlementRecord && entitlementRecord.plan_type !== 'free');
  let daysRemaining: number | null = isAdmin ? 3650 : null;

  if (!isAdmin && isPremium && entitlementRecord?.expires_at) {
    const expiresAt = new Date(entitlementRecord.expires_at).getTime();
    const now = Date.now();
    if (expiresAt < now) {
      isPremium = false;
      daysRemaining = 0;
    } else {
      daysRemaining = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
    }
  }

  const getSimulationQuota = async (): Promise<QuotaStatus> => {
    if (isAdmin) {
      return { allowed: true, used: 0, max: Infinity, isUnlimited: true };
    }
    return await checkSimulationQuota(userId, mockAttempts);
  };

  const getPracticeQuota = async (): Promise<QuotaStatus> => {
    if (isAdmin) {
      return { allowed: true, used: 0, max: Infinity, isUnlimited: true };
    }
    return await checkPracticeQuota(userId, practiceAttempts);
  };

  const upgradeToPro = async (method: 'gcash' | 'maya' | 'card' = 'gcash') => {
    return await upgradeToPremiumApi(userId, method);
  };

  return {
    isPremium,
    isAdmin,
    daysRemaining,
    planType: isAdmin ? 'pro' : (entitlementRecord?.plan_type || 'free'),
    entitlementRecord,
    getSimulationQuota,
    getPracticeQuota,
    upgradeToPro,
  };
}
