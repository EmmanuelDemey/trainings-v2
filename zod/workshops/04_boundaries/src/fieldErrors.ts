import type * as z from 'zod';

/** The key of the issues that belong to no field. */
export const FORM = '_form';

/**
 * TODO 2: `['lines', 0, 'quantity']` → `'lines[0].quantity'` — the key a form
 * library uses to find the input an error belongs to. An empty path belongs to
 * no field: it goes under `FORM`.
 */
export function pathToKey(path: readonly PropertyKey[]): string {
  return path.map(String).join('.');
}

/**
 * TODO 2: one message per field — the FIRST one, the one a form shows under its
 * input, keyed by `pathToKey`. Every broken field at once.
 */
export function toFieldErrors(error: z.ZodError): Record<string, string> {
  void error;
  return {};
}
