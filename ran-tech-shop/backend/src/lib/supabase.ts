import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.warn(
    '⚠️  SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing. Set them in backend/.env before calling the API.'
  );
}

// Service-role client. Bypasses RLS — server-side only, never expose to the browser.
export const supabase: SupabaseClient = createClient(
  supabaseUrl ?? 'http://localhost:54321',
  serviceRoleKey ?? 'public-anon-placeholder',
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
);

/**
 * Convert a Supabase `{ data, error }` result into a thrown-error style so
 * controller code stays close to the previous Prisma flow. Use sparingly —
 * most controllers handle `{ data, error }` directly for richer responses.
 */
export const unwrap = <T>(result: { data: T | null; error: { message: string } | null }): T => {
  if (result.error) throw new Error(result.error.message);
  if (result.data === null) throw new Error('No data returned');
  return result.data;
};
