import { createClient } from '@supabase/supabase-js';

// Supabase's current browser setup for Vite/React uses the project URL and
// publishable key. The publishable key is safe for browser use when RLS is
// correctly configured; never expose a secret/service-role key here.
const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = url && publishableKey
  ? createClient(url, publishableKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export async function signIn(email, password) {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'
    );
  }
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  if (!supabase) return { error: null };
  return supabase.auth.signOut();
}

export async function getCurrentSession() {
  if (!supabase) return { data: { session: null }, error: null };
  return supabase.auth.getSession();
}
