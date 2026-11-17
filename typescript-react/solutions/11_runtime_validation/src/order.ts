// An order, as a <form> sends it: FormData — strings, or nothing.
import { z } from 'zod';

export const OrderSchema = z.object({
  quantity: z.coerce.number().int().positive().default(1),
  email: z.email(),
  shipping: z.enum(['standard', 'express', 'pickup']).default('standard'),
  giftWrap: z.stringbool().default(false),
});

export type Order = z.infer<typeof OrderSchema>;

export type OrderResult = { ok: true; order: Order } | { ok: false; error: string };

/** Never throws: the order, or a message naming every field that is wrong — not just the first one. */
export function parseOrder(formData: FormData): OrderResult {
  const result = OrderSchema.safeParse(Object.fromEntries(formData));
  if (result.success) return { ok: true, order: result.data };
  return { ok: false, error: z.prettifyError(result.error) };
}
