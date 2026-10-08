import * as z from 'zod';

export type FetchResult<T> =
  | { ok: true; data: T }
  /** The server answered, but not with a 2xx. */
  | { ok: false; kind: 'http'; status: number }
  /** The server answered 2xx — with a body that breaks the contract. */
  | { ok: false; kind: 'contract'; message: string };

/**
 * `fetch`, then check the body against `schema` before anyone uses it. The
 * caller gets either data whose type is the schema's output, or the reason why
 * not — never a body typed `any`.
 *
 * `fetchFn` defaults to the global `fetch`; the specs pass a fake one.
 */
export async function fetchJson<S extends z.ZodType>(
  url: string,
  schema: S,
  fetchFn: typeof fetch = fetch,
): Promise<FetchResult<z.output<S>>> {
  const response = await fetchFn(url);
  if (!response.ok) {
    return { ok: false, kind: 'http', status: response.status };
  }

  const result = schema.safeParse(await response.json());
  if (!result.success) {
    return { ok: false, kind: 'contract', message: z.prettifyError(result.error) };
  }
  return { ok: true, data: result.data };
}
