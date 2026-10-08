import * as z from 'zod';

/**
 * The query string of `/concerts?q=jazz&page=2&tags=soul,funk&sort=price`.
 * Everything arrives as a string, or not at all: the schema turns it into the
 * values the search actually works with.
 */
export const SearchParamsSchema = z.object({
  /** Free text, trimmed. Under two characters it matches everything: rejected. */
  q: z.string().trim().min(2).optional(),
  /** `"2"` → `2`. Missing → page 1. `"0"`, `"-1"`, `"abc"` → rejected. */
  page: z.coerce.number().int().min(1).default(1),
  /** `"soul, funk"` → `['soul', 'funk']`, then checked as an array: 5 tags at most. */
  tags: z
    .string()
    .transform((value) => value.split(',').map((tag) => tag.trim()).filter(Boolean))
    .pipe(z.array(z.string().min(2)).max(5))
    .default([]),
  /** An unknown sort is not worth a 400: fall back to the default one. */
  sort: z.enum(['date', 'price']).catch('date'),
});

export type SearchParams = z.output<typeof SearchParamsSchema>;

/** `parseSearch('?q=jazz&page=2')` — throws a `ZodError` on a query it cannot use. */
export function parseSearch(query: string): SearchParams {
  return SearchParamsSchema.parse(Object.fromEntries(new URLSearchParams(query)));
}
