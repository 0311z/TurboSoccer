import { getBrowserClient } from '@/lib/supabase/browser';
import { trace } from '@/lib/logger';
export async function fetchMyProfile() {
  const t = trace('profiles.mine');
  try {
    const client = await getBrowserClient();
    if (!client) return null;
    t.step(1, 2, 'comprobar sesión');
    const { data: auth, error: authError } = await client.auth.getUser();
    if (authError) throw authError;
    if (!auth.user) return null;
    t.step(2, 2, 'consultar perfil y confirmación de edad');
    const results = await Promise.all([
      client.from('profiles').select('id,username,roblox_username,bio,role,reputation,trades_completed').eq('id', auth.user.id).single(),
      client.from('profile_private').select('age_confirmed_at').eq('id', auth.user.id).single(),
    ]);
    for (const result of results) if (result.error) throw result.error;
    const {profileSchema,privateProfileSchema}=await import('@/lib/data/profiles.schema');
    const profile = profileSchema.parse(results[0]?.data);
    const privateData = privateProfileSchema.parse(results[1]?.data);
    t.ok();
    return { ...profile, ageConfirmed: Boolean(privateData.age_confirmed_at) };
  } catch (error) { throw t.fail(error); }
}
export async function signOut() {
  const t = trace('auth.signOut');
  try {
    const client = await getBrowserClient();
    if (!client) return;
    t.step(1, 1, 'cerrar sesión');
    const { error } = await client.auth.signOut();
    if (error) throw error;
    t.ok();
  } catch (error) { throw t.fail(error); }
}
