import { z } from 'zod';
import { getBrowserClient } from '@/lib/supabase/browser';
import { trace } from '@/lib/logger';
import { validateProfileInput, type ProfileInput } from './accountValidation';
const ownListings = z.array(z.object({ id: z.uuid(), status: z.enum(['open', 'pending', 'completed', 'cancelled', 'expired']), note: z.string(), created_at: z.string().datetime({ offset: true }), expires_at: z.string().datetime({ offset: true }) }));
export type AccountListing = z.infer<typeof ownListings>[number];
export async function updateMyProfile(input: ProfileInput) {
  const t = trace('account.update');
  try {
    t.step(1, 3, 'validar los campos del perfil');
    if (validateProfileInput(input)) throw new Error('Invalid profile fields');
    const client = await getBrowserClient();
    if (!client) throw new Error('Database unavailable');
    t.step(2, 3, 'comprobar la sesión');
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) throw error || new Error('Missing session');
    t.step(3, 3, 'actualizar solo las columnas permitidas por RLS');
    const result = await client.from('profiles').update({ username: input.username, roblox_username: input.robloxUsername || null, bio: input.bio }).eq('id', data.user.id).select('id').single();
    if (result.error) throw result.error;
    t.ok();
  } catch (error) { throw t.fail(error); }
}
export async function confirmMyAge() {
  const t = trace('account.confirmAge');
  try {
    t.step(1, 1, 'confirmar el umbral de edad mediante RPC');
    const client = await getBrowserClient();
    if (!client) throw new Error('Database unavailable');
    const { error } = await client.rpc('confirm_age');
    if (error) throw error;
    t.ok();
  } catch (error) { throw t.fail(error); }
}
export async function fetchAccountListings(): Promise<AccountListing[]> {
  const t = trace('account.listings');
  try {
    const client = await getBrowserClient();
    if (!client) return [];
    t.step(1, 2, 'comprobar la sesión');
    const auth = await client.auth.getUser();
    if (auth.error || !auth.data.user) throw auth.error || new Error('Missing session');
    t.step(2, 2, 'consultar únicamente los anuncios propios');
    const { data, error } = await client.from('trade_listings').select('id,status,note,created_at,expires_at').eq('owner_id', auth.data.user.id).order('created_at', { ascending: false }).limit(40);
    if (error) throw error;
    const now = Date.now();
    const result = ownListings.parse(data).map(listing => ({ ...listing, status: listing.status === 'open' && Date.parse(listing.expires_at) <= now ? 'expired' as const : listing.status }));
    t.ok({ count: result.length });
    return result;
  } catch (error) { throw t.fail(error); }
}
export async function deleteMyAccount(confirmation: string) {
  const t = trace('account.delete');
  try {
    t.step(1, 2, 'validar la confirmación explícita');
    if (confirmation !== 'DELETE') throw new Error('Account deletion was not confirmed');
    const client = await getBrowserClient();
    if (!client) throw new Error('Database unavailable');
    t.step(2, 2, 'eliminar la cuenta propia mediante RPC');
    const { error } = await client.rpc('delete_my_account');
    if (error) throw error;
    const localSignOut = await client.auth.signOut({ scope: 'local' });
    if (localSignOut.error) t.fail(localSignOut.error);
    t.ok();
  } catch (error) { throw t.fail(error); }
}
