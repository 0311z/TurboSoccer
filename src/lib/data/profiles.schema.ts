import { z } from 'zod';
export const profileSchema = z.object({
  id: z.uuid(), username: z.string(), roblox_username: z.string().nullable(), bio: z.string(),
  role: z.enum(['user', 'moderator', 'admin', 'owner']), reputation: z.number().int(), trades_completed: z.number().int().nonnegative(),
});
export const privateProfileSchema=z.object({age_confirmed_at:z.string().nullable()});
