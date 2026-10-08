import type * as z from 'zod';

export type FetchResult<T> =
  | { ok: true; data: T }
  /** The server answered, but not with a 2xx. */
  | { ok: false; kind: 'http'; status: number }
  /** The server answered 2xx — with a body that breaks the contract. */
  | { ok: false; kind: 'contract'; message: string };

/**
 * `fetch`, then hand the body over. This is the code most apps ship: the body is
 * `any`, cast to whatever the caller hoped for, and a renamed field on the
 * server becomes an `undefined` three screens away.
 *
 * TODO 3: check the body against `schema` before anyone uses it, and report
 * what went wrong instead of throwing:
 *   - a non-2xx answer → `{ ok: false, kind: 'http', status }`, without reading the body
 *   - a body that breaks the schema → `{ ok: false, kind: 'contract', message }`,
 *     the message naming each broken field
 *
 * `fetchFn` defaults to the global `fetch`; the specs pass a fake one.
 */
export async function fetchJson<S extends z.ZodType>(
  url: string,
  schema: S,
  fetchFn: typeof fetch = fetch,
): Promise<FetchResult<z.output<S>>> {
  void schema;
  const response = await fetchFn(url);
  return { ok: true, data: await response.json() };
}
