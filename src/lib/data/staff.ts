import { getBrowserClient } from '@/lib/supabase/browser';
import { trace } from '@/lib/logger';
import { parseAppraisal, type AppraisalInput } from './accountValidation';
export async function setItemAppraisal(input: AppraisalInput) {
  const t = trace('staff.setItemValue', { itemId: input.itemId });
  try {
    t.step(1, 2, 'validar los datos de valoración');
    const parsed = parseAppraisal(input);
    if (!parsed) throw new Error('Invalid appraisal');
    const client = await getBrowserClient();
    if (!client) throw new Error('Database unavailable');
    t.step(2, 2, 'escribir mediante RPC autorizada y auditada');
    const { error } = await client.rpc('set_item_value', { p_item_id: input.itemId, p_value: parsed.value, p_demand: parsed.demand, p_reason: parsed.reason });
    if (error) throw error;
    t.ok();
  } catch (error) { throw t.fail(error); }
}
