// An order, as a <form> sends it: FormData — strings, or nothing.
import { z } from 'zod';

/** TODO 4: quantity, email, shipping and giftWrap — read tests/order.spec.tsx. */
export const OrderSchema = z.object({});

/** TODO 4: inferred from OrderSchema. */
export type Order = Record<string, unknown>;

export type OrderResult = { ok: true; order: Order } | { ok: false; error: string };

/** TODO 4: never throws — the order, or a message naming every field that is wrong, not just the first one. */
export function parseOrder(formData: FormData): OrderResult {
  return { ok: false, error: 'TODO 4' };
}
