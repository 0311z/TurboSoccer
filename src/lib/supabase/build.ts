import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
export function getBuildClient() {
  if (!env.configured) return null;
  return createClient(env.supabaseUrl, env.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
