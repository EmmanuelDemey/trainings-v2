import { describe, expect, it } from 'vitest';
import * as z from 'zod';
import { fetchJson } from '../src/fetchJson';

const ConcertSchema = z.object({ id: z.string(), artist: z.string(), price: z.number() });

/** A `fetch` that answers every request with `body` and `status`. */
function respondWith(body: unknown, status = 200): typeof fetch {
  return async () => Response.json(body, { status });
}

describe('fetchJson', () => {
  it('returns the parsed body when it matches the schema', async () => {
    const fetchFn = respondWith({ id: 'c1', artist: 'Fela', price: 30, extra: true });

    expect(await fetchJson('/concerts/c1', ConcertSchema, fetchFn)).toEqual({
      ok: true,
      data: { id: 'c1', artist: 'Fela', price: 30 },
    });
  });

  it('reports a non-2xx answer with its status, without reading the body', async () => {
    const fetchFn = respondWith({ message: 'Not found' }, 404);

    expect(await fetchJson('/concerts/nope', ConcertSchema, fetchFn)).toEqual({
      ok: false,
      kind: 'http',
      status: 404,
    });
  });

  it('reports a body that breaks the contract, naming the field', async () => {
    const fetchFn = respondWith({ id: 'c1', artist: 'Fela', price: '30 €' });

    const result = await fetchJson('/concerts/c1', ConcertSchema, fetchFn);

    expect(result).toMatchObject({ ok: false, kind: 'contract' });
    expect(result.ok === false && result.kind === 'contract' && result.message).toContain('→ at price');
  });

  it('works with any schema — here, a list', async () => {
    const fetchFn = respondWith([{ id: 'c1', artist: 'Fela', price: 30 }]);

    const result = await fetchJson('/concerts', z.array(ConcertSchema), fetchFn);

    expect(result.ok && result.data).toHaveLength(1);
  });
});
