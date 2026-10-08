import * as z from 'zod';
import { ConcertSchema } from './concert';

/**
 * The body of `POST /concerts`: a concert the server has not given an id yet.
 * An `id` sent by the client is stripped, never trusted.
 */
export const NewConcertSchema = ConcertSchema.omit({ id: true });

/**
 * The body of `PATCH /concerts/:id`: every field optional.
 *
 * `.partial()` alone keeps the `.default()`s of `tags` and `soldOut`, so an empty
 * patch would come out as `{ tags: [], soldOut: false }` — and wipe the tags of
 * the concert it is applied to. Those two are redeclared without a default.
 */
export const ConcertPatchSchema = NewConcertSchema.partial().extend({
  tags: z.array(z.string()).optional(),
  soldOut: z.boolean().optional(),
});

/** One line of the agenda: no venue, no price. */
export const ConcertSummarySchema = ConcertSchema.pick({ id: true, artist: true, startsAt: true });

export type NewConcert = z.output<typeof NewConcertSchema>;
export type ConcertPatch = z.output<typeof ConcertPatchSchema>;
export type ConcertSummary = z.output<typeof ConcertSummarySchema>;
