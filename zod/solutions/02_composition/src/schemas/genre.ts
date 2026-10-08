import * as z from 'zod';

/**
 * A genre and its sub-genres, as deep as the catalogue goes: jazz › bebop ›
 * hard bop. The getter defers the reference to `GenreSchema` until it is read,
 * by which time the constant exists — and lets TypeScript infer the recursive
 * type without a hand-written interface.
 */
export const GenreSchema = z.object({
  name: z.string().min(1),
  get subgenres() {
    return z.array(GenreSchema);
  },
});

export type Genre = z.output<typeof GenreSchema>;
