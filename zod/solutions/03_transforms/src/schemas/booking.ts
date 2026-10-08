import * as z from 'zod';

/** Trimmed and lower-cased BEFORE the format check: `' Nina@Example.com '` is valid. */
const EmailSchema = z.string().trim().toLowerCase().pipe(z.email());

/**
 * The booking form. Each field is valid on its own; the rules below are about
 * how the fields relate to each other.
 */
export const BookingSchema = z
  .object({
    email: EmailSchema,
    confirmEmail: EmailSchema,
    tier: z.enum(['standard', 'vip', 'backstage']),
    quantity: z.coerce.number().int().min(1).max(10),
    promoCode: z.string().optional(),
  })
  // One rule, one issue: `.refine()`, with the `path` of the field to blame.
  .refine((booking) => booking.email === booking.confirmEmail, {
    message: 'The two email addresses do not match',
    path: ['confirmEmail'],
  })
  // Several rules that may all fail at once: `.superRefine()` and `ctx.addIssue`.
  .superRefine((booking, ctx) => {
    if (booking.tier !== 'backstage') return;

    if (booking.quantity > 2) {
      ctx.addIssue({
        code: 'custom',
        message: 'Backstage passes are limited to 2 per order',
        path: ['quantity'],
      });
    }
    if (booking.promoCode !== undefined) {
      ctx.addIssue({
        code: 'custom',
        message: 'Promo codes do not apply to backstage passes',
        path: ['promoCode'],
      });
    }
  });

export type Booking = z.output<typeof BookingSchema>;
