import * as z from 'zod';

/**
 * TODO 5: a genre and its `subgenres` — a list of genres, as deep as the
 * catalogue goes: jazz › bebop › hard bop.
 */
export const GenreSchema = z.object({
  name: z.string().min(1),
});

export type Genre = z.output<typeof GenreSchema>;
