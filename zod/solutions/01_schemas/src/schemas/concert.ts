import * as z from 'zod';

/**
 * Where a concert takes place. Every field is required, and the capacity is a
 * count of people: a whole number, above zero.
 */
export const VenueSchema = z.object({
  name: z.string().min(1),
  city: z.string().min(1),
  capacity: z.number().int().positive(),
});

/**
 * A concert, as the ticketing API sends it.
 *
 * `tags` and `soldOut` may be missing from the payload: the schema fills them in,
 * which is why the input and the output types differ.
 */
export const ConcertSchema = z.object({
  id: z.uuid(),
  artist: z.string().min(1),
  startsAt: z.iso.datetime(),
  venue: VenueSchema,
  price: z.number().nonnegative(),
  tags: z.array(z.string()).default([]),
  soldOut: z.boolean().default(false),
  website: z.url().optional(),
});

/** What the API may send: `tags` and `soldOut` are optional. */
export type ConcertInput = z.input<typeof ConcertSchema>;

/** What the rest of the app works with: the defaults have been applied. */
export type Concert = z.output<typeof ConcertSchema>;
