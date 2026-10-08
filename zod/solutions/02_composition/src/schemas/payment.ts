import * as z from 'zod';

/** Pay by card: the last four digits, and the expiry as `MM/YY`. */
export const CardPaymentSchema = z.object({
  method: z.literal('card'),
  last4: z.string().regex(/^\d{4}$/),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/),
});

/** Pay with a PayPal account: its email. */
export const PaypalPaymentSchema = z.object({
  method: z.literal('paypal'),
  email: z.email(),
});

/** Pay with a gift voucher: an 8-character code. */
export const VoucherPaymentSchema = z.object({
  method: z.literal('voucher'),
  code: z.string().length(8),
});

/**
 * One of the three, told apart by `method`. A discriminated union reads
 * `method` first and validates against that one option only: its errors talk
 * about the card a card payment is missing, not about all three shapes.
 */
export const PaymentSchema = z.discriminatedUnion('method', [
  CardPaymentSchema,
  PaypalPaymentSchema,
  VoucherPaymentSchema,
]);

export type Payment = z.output<typeof PaymentSchema>;

/** What the receipt prints — exhaustive over `method`, thanks to the union. */
export function describePayment(payment: Payment): string {
  switch (payment.method) {
    case 'card':
      return `Card ending in ${payment.last4}`;
    case 'paypal':
      return `PayPal (${payment.email})`;
    case 'voucher':
      return `Voucher ${payment.code}`;
  }
}
