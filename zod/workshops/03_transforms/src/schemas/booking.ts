import * as z from 'zod';

/** TODO 2: trim and lower-case the address BEFORE checking its format — `' Nina@Example.com '` is valid. */
const EmailSchema = z.email();

/**
 * The booking form. Each field is valid on its own; what is missing are the
 * rules about how the fields relate to each other.
 *
 * TODO 2: `quantity` comes from an `<input>`: a string. Coerce it.
 * TODO 2: `confirmEmail` must equal `email` — the error goes on `confirmEmail`.
 * TODO 2: on a `backstage` booking, BOTH of these, reported together when both fail:
 *   - `quantity` above 2 → 'Backstage passes are limited to 2 per order', on `quantity`
 *   - a `promoCode` → 'Promo codes do not apply to backstage passes', on `promoCode`
 */
export const BookingSchema = z.object({
  email: EmailSchema,
  confirmEmail: EmailSchema,
  tier: z.enum(['standard', 'vip', 'backstage']),
  quantity: z.number().int().min(1).max(10),
  promoCode: z.string().optional(),
});

export type Booking = z.output<typeof BookingSchema>;
