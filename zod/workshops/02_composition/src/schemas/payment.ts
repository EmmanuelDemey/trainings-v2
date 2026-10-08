import * as z from 'zod';

/** Pay by card: the last four digits, and the expiry as `MM/YY`. Done for you — the model of the two below. */
export const CardPaymentSchema = z.object({
  method: z.literal('card'),
  last4: z.string().regex(/^\d{4}$/),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/),
});

/** TODO 3: pay with a PayPal account — its `email`. */
export const PaypalPaymentSchema = z.object({
  method: z.literal('paypal'),
});

/** TODO 3: pay with a gift voucher — a `code` of exactly 8 characters. */
export const VoucherPaymentSchema = z.object({
  method: z.literal('voucher'),
});

/**
 * TODO 3: one of the three. A plain `z.union` works… until a payload is wrong:
 * read the issues it reports for `{ method: 'cash' }`, then make it a union
 * that reads `method` first.
 */
export const PaymentSchema = z.union([CardPaymentSchema, PaypalPaymentSchema, VoucherPaymentSchema]);

export type Payment = z.output<typeof PaymentSchema>;

/**
 * TODO 3: what the receipt prints — `Card ending in 4242`,
 * `PayPal (nina@example.com)`, `Voucher GIFT2026`. Write it as a `switch` on
 * `payment.method`, and see what TypeScript knows in each branch.
 */
export function describePayment(payment: Payment): string {
  throw new Error(`TODO 3: describe ${payment.method}`);
}
