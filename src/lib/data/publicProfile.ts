import { z } from 'zod';
import { getBrowserClient } from '@/lib/supabase/browser';
import { trace } from '@/lib/logger';
const profileSchema = z.object({ id: z.uuid(), username: z.string(), roblox_username: z.string().nullable(), bio: z.string(), reputation: z.number().int(), trades_completed: z.number().int().nonnegative(), created_at: z.string().datetime({ offset: true }) });
export async function fetchPublicProfile(username: string) {
  const t = trace('profiles.public');
  try {
    if (!/^[a-z0-9_]{3,20}$/.test(username)) return null;
    const client = await getBrowserClient();
    if (!client) return null;
    t.step(1, 1, 'consultar únicamente los datos públicos');
    const { data, error } = await client.from('profiles').select('id,username,roblox_username,bio,reputation,trades_completed,created_at').eq('username', username).maybeSingle();
    if (error) throw error;
    t.ok();
    return data ? profileSchema.parse(data) : null;
  } catch (error) { throw t.fail(error); }
}
