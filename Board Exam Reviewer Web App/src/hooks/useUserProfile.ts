import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../lib/db';
import type { LocalUserProfile } from '../lib/db';
import { DEFAULT_EXAM_DATE } from '../lib/constants';
import { supabase } from '../lib/supabase';
import { mergeGuestToAuth } from '../lib/merge';

export function useUserProfile(): { profile: LocalUserProfile | null; isLoading: boolean } {
  const profiles = useLiveQuery(() => db.user_profile.toArray());

  useEffect(() => {
    async function ensureGuestProfile() {
      if (profiles !== undefined && profiles.length === 0) {
        const guestId = uuidv4();
        const newProfile: LocalUserProfile = {
          id: guestId,
          display_name: 'Kapatid',
          exam_target: 'cse-professional',
          exam_level: 'professional',
          exam_date: DEFAULT_EXAM_DATE,
          target_score: 85,
          onboarding_completed: false,
          auth_user_id: null,
          local_merge_completed: false,
          created_at: new Date().toISOString(),
        };
        await db.user_profile.add(newProfile);
      }
    }
    ensureGuestProfile();
  }, [profiles]);

  // Sync Supabase Auth Session (Google OAuth, Facebook OAuth, Email OTP) to Dexie Local Profile
  useEffect(() => {
    if (!supabase) return;

    const handleAuthUser = async (user: any) => {
      if (!user) return;
      const authUserId = user.id;
      const userEmail = user.email || '';
      const displayName = user.user_metadata?.full_name || user.user_metadata?.name || userEmail.split('@')[0] || 'Learner';

      const existingProfiles = await db.user_profile.toArray();
      const currentProfile = existingProfiles[0];

      if (currentProfile) {
        if (currentProfile.auth_user_id !== authUserId || currentProfile.email !== userEmail) {
          console.log(`Syncing authenticated user (${userEmail}) to local profile...`);
          await mergeGuestToAuth(currentProfile.id, authUserId);
          await db.user_profile.update(currentProfile.id, {
            auth_user_id: authUserId,
            email: userEmail,
            display_name: displayName,
            onboarding_completed: true,
            local_merge_completed: true,
          });
        }
      }
    };

    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleAuthUser(session.user);
      }
    });

    // Listen to real-time auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await handleAuthUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const isLoading = profiles === undefined;
  const profile = profiles && profiles.length > 0 ? (profiles[0] || null) : null;

  return { profile, isLoading };
}
