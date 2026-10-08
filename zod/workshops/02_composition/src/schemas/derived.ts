import * as z from 'zod';
import { ConcertSchema } from './concert';

/**
 * TODO 1: the body of `POST /concerts` — a concert the server has not given an
 * id yet. An `id` sent by the client must be stripped, never trusted.
 * Derive it from `ConcertSchema`: do not copy its fields.
 */
export const NewConcertSchema = ConcertSchema;

/**
 * TODO 2: the body of `PATCH /concerts/:id` — every field of a new concert,
 * optional. Start with the obvious one-liner, run the specs, and read what an
 * empty patch turns into.
 */
export const ConcertPatchSchema = z.never();

/** TODO 1 too: one line of the agenda — the id, the artist and the date, nothing else. */
export const ConcertSummarySchema = z.never();

export type NewConcert = z.output<typeof NewConcertSchema>;
export type ConcertPatch = z.output<typeof ConcertPatchSchema>;
export type ConcertSummary = z.output<typeof ConcertSummarySchema>;
