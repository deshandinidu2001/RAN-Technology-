import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Lazy-initialized Supabase service-role client.
 *
 * We must NOT create the client at module load time, because in server.ts
 * ES imports are hoisted above `dotenv.config()`. If we read `process.env`
 * here at import time, SUPABASE_URL is still undefined and the client gets
 * built against the localhost fallback — then every request fails with
 * `TypeError: fetch failed` in production.
 *
 * Instead, build (and cache) the client the first time it's actually used,
 * by which point dotenv has populated process.env.
 */
let cached: SupabaseClient | null = null;

const buildClient = (): SupabaseClient => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing. Set them in backend/.env or platform env config.'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
};

// Proxy so existing `import { supabase } from '../lib/supabase'` callers keep
// working without changes — every property access lazily builds the real client.
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    if (!cached) cached = buildClient();
    const value = Reflect.get(cached, prop, receiver);
    return typeof value === 'function' ? value.bind(cached) : value;
  },
});

export const unwrap = <T>(result: { data: T | null; error: { message: string } | null }): T => {
  if (result.error) throw new Error(result.error.message);
  if (result.data === null) throw new Error('No data returned');
  return result.data;
};
