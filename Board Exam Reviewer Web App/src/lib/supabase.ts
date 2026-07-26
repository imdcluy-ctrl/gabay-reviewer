import { createClient, SupabaseClient } from '@supabase/supabase-js';

const env = typeof import.meta !== 'undefined' ? (import.meta as any).env : {};
const supabaseUrl = env?.VITE_SUPABASE_URL;
const supabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

if (!supabase) {
  // Silent info log in browser mode
}
