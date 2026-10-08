import * as z from 'zod';

// Given — the concert of workshop 1, as the ticketing API sends it.

export const VenueSchema = z.object({
  name: z.string().min(1),
  city: z.string().min(1),
  capacity: z.number().int().positive(),
});

export const ConcertSchema = z.object({
  id: z.uuid(),
  artist: z.string().min(1),
  startsAt: z.iso.datetime(),
  venue: VenueSchema,
  price: z.number().nonnegative(),
  tags: z.array(z.string()).default([]),
  soldOut: z.boolean().default(false),
});

export type Concert = z.output<typeof ConcertSchema>;
