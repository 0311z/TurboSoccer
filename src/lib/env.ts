import * as z from 'zod/mini';
import {publicEnv} from '@/config/publicEnv';
const httpUrl=z.url().check(z.refine(value=>{try{const url=new URL(value);return url.protocol==='https:'||(url.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname));}catch{return false;}},'Use HTTPS, or HTTP only for localhost.'));
const schema = z.object({
  supabaseUrl: z.union([httpUrl, z.literal('')]),
  publishableKey: z.union([z.string().check(z.startsWith('sb_publishable_')), z.literal('')]),
  siteUrl: httpUrl,
});
const parsed=schema.parse(publicEnv);
if (Boolean(parsed.supabaseUrl) !== Boolean(parsed.publishableKey)) {
  throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY together.');
}
if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_DEMO === '1') {
  throw new Error('Demo data cannot be included in a production build.');
}
export const env={...publicEnv,...parsed};
