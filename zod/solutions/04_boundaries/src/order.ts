import * as z from 'zod';

// Given — the order form of the shop, used by `toFieldErrors` and its specs.

export const OrderSchema = z
  .object({
    customer: z.object({
      name: z.string().min(1, 'Your name is required'),
      email: z.email('Enter a valid email address'),
    }),
    lines: z
      .array(
        z.object({
          concertId: z.string().min(1),
          quantity: z.number().int().min(1, 'At least one ticket'),
        }),
      )
      .min(1, 'Your basket is empty'),
  })
  .refine((order) => order.lines.length <= 3, 'Three concerts per order at most');
