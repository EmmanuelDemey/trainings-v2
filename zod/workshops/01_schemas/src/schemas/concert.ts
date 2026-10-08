import * as z from 'zod';

/**
 * TODO 1: where a concert takes place.
 *   - `name` and `city`: non-empty strings
 *   - `capacity`: a count of people — a whole number, above zero
 */
export const VenueSchema = z.object({});

/**
 * TODO 2: a concert, as the ticketing API sends it.
 *   - `id`: a UUID
 *   - `artist`: a non-empty string
 *   - `startsAt`: an ISO 8601 date-time (`2026-11-14T20:30:00Z`) — a date alone is not enough
 *   - `venue`: a `VenueSchema`
 *   - `price`: a number, zero or above (some concerts are free)
 *   - `tags`: a list of strings — `[]` when the API leaves it out
 *   - `soldOut`: a boolean — `false` when the API leaves it out
 *   - `website`: a URL, optional
 */
export const ConcertSchema = z.object({});

/** What the API may send. Hover it once TODO 2 is done: which fields are optional? */
export type ConcertInput = z.input<typeof ConcertSchema>;

/** What the rest of the app works with. Hover it too: what changed? */
export type Concert = z.output<typeof ConcertSchema>;
