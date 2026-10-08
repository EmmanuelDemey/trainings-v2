import type * as z from 'zod';

/** The key of the issues that belong to no field. */
export const FORM = '_form';

/**
 * `['lines', 0, 'quantity']` → `'lines[0].quantity'`: the key a form library
 * uses to find the input an error belongs to.
 */
export function pathToKey(path: readonly PropertyKey[]): string {
  if (path.length === 0) return FORM;
  return path
    .map((segment, index) =>
      typeof segment === 'number' ? `[${segment}]` : `${index === 0 ? '' : '.'}${String(segment)}`,
    )
    .join('');
}

/**
 * One message per field — the first one, the one a form shows under its input.
 * Unlike `z.flattenError`, nested fields keep their full path instead of being
 * merged into their top-level parent.
 */
export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = pathToKey(issue.path);
    errors[key] ??= issue.message;
  }
  return errors;
}
