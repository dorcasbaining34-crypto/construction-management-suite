import { createClient } from '@supabase/supabase-js';

// Browser-safe Supabase configuration for the Vite/React application.
// Accept the current publishable key and the legacy anon key while projects
// transition to Supabase's new API-key naming.
//
// Supabase client URLs must be the project root, e.g.
// https://your-project-ref.supabase.co
// If someone accidentally pastes /auth/v1 or /rest/v1, strip that path so
// supabase-js does not build an invalid request URL such as /auth/v1/auth/v1/.
const rawUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const publishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

function normalizeSupabaseUrl(value) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    // Keep only the origin. This also safely removes accidental paths,
    // query strings, or fragments copied from Supabase API documentation.
    return parsed.origin;
  } catch {
    return null;
  }
}

const url = normalizeSupabaseUrl(rawUrl);

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
      'Supabase is not configured. In Vercel, set VITE_SUPABASE_URL to your project URL (https://PROJECT_REF.supabase.co) and set VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY.'
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
