import { supabase } from './supabase';

export async function sendEmailOtp(email: string) {
  if (!supabase) {
    throw new Error('Supabase client is not configured.');
  }
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });
  if (error) throw error;
  return data;
}

export async function verifyEmailOtp(email: string, token: string) {
  if (!supabase) {
    throw new Error('Supabase client is not configured.');
  }
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email: string, pass: string) {
  if (!supabase) {
    throw new Error('Supabase client is not configured in development mode.');
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, pass: string) {
  if (!supabase) {
    throw new Error('Supabase client is not configured in development mode.');
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });
  if (error) throw error;
  return data;
}

export async function signOutUser() {
  if (supabase) {
    await supabase.auth.signOut();
  }
}

export async function getCurrentUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}
