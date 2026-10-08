import * as z from 'zod';

/**
 * TODO 1: the query string of `/concerts?q=jazz&page=2&tags=soul,funk&sort=price`.
 * Everything arrives as a string, or not at all — turn it into the values the
 * search actually works with:
 *   - `q`: free text, trimmed; under two characters once trimmed → rejected; optional
 *   - `page`: `"2"` → `2`; missing → `1`; `"0"`, `"-1"`, `"abc"`, `"1.5"` → rejected
 *   - `tags`: `"soul, funk,,"` → `['soul', 'funk']`, then at most 5 tags of 2+ characters; missing → `[]`
 *   - `sort`: `'date'` or `'price'`; anything else falls back to `'date'` — not worth a 400
 */
export const SearchParamsSchema = z.object({
  q: z.string().optional(),
  page: z.string().optional(),
  tags: z.string().optional(),
  sort: z.string().optional(),
});

export type SearchParams = z.output<typeof SearchParamsSchema>;

/** `parseSearch('?q=jazz&page=2')` — throws a `ZodError` on a query it cannot use. */
export function parseSearch(query: string): SearchParams {
  return SearchParamsSchema.parse(Object.fromEntries(new URLSearchParams(query)));
}
