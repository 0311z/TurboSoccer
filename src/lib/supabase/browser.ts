import type { SupabaseClient } from '@supabase/supabase-js';
import { publicEnv as env } from '@/config/publicEnv';
import { trace } from '@/lib/logger';
let pending: Promise<SupabaseClient> | null = null;
export async function getBrowserClient(): Promise<SupabaseClient | null> {
  if (!env.configured) return null;
  const t = trace('supabase.browser');
  try {
    if (!pending) pending = import('@supabase/supabase-js').then(({ createClient }) => createClient(env.supabaseUrl, env.publishableKey, {
      auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    }));
    const client = await pending;
    t.ok();
    return client;
  } catch (error) { pending = null; throw t.fail(error); }
}
