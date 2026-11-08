import { z } from 'zod';
const safeInteger = z.union([z.number(), z.string().regex(/^\d+$/)]).transform(Number).refine(value => Number.isSafeInteger(value) && value >= 0);
export const trendSchema = z.object({ trend: z.enum(['unknown', 'stable', 'rising', 'falling']), change_percent: z.union([z.number(), z.string()]).transform(Number).refine(Number.isFinite).nullable() });
export const statsSchema = z.object({ offering_count: safeInteger, seeking_count: safeInteger });
export const historySchema = z.array(z.object({ value: safeInteger.nullable(), demand: z.number().int().min(1).max(5).nullable(), created_at: z.iso.datetime({offset:true}), reason: z.string().nullable() }));
