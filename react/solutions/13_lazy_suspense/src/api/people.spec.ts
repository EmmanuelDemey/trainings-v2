import { beforeEach, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { clearPeopleCache, forgetPerson, getPerson } from './people';

describe('getPerson', () => {
  beforeEach(() => clearPeopleCache());

  it('resolves with the person of that id', async () => {
    await expect(getPerson('1')).resolves.toMatchObject({ id: '1', name: 'Luke Skywalker' });
  });

  it('rejects when the API answers with an error status', async () => {
    await expect(getPerson('404')).rejects.toThrow('HTTP 404');
  });

  // Step 2. `use()` renders a suspended component again from scratch: it must
  // get back the very promise it suspended on, not a new one.
  it('returns the same promise when called twice with the same id', async () => {
    const first = getPerson('1');

    expect(getPerson('1')).toBe(first);
    await first;
  });

  it('sends a single request for repeated calls with the same id', async () => {
    let requests = 0;
    server.events.on('request:start', ({ request }) => {
      if (new URL(request.url).pathname === '/api/people/2') requests += 1;
    });

    await Promise.all([getPerson('2'), getPerson('2'), getPerson('2')]);

    expect(requests).toBe(1);
  });

  it('gives a different promise for a different id', async () => {
    const luke = getPerson('1');
    const threepio = getPerson('2');

    expect(threepio).not.toBe(luke);
    await Promise.all([luke, threepio]);
  });

  it('fetches again after forgetPerson, so a failure can be retried', async () => {
    server.use(
      http.get('/api/people/:id', () => HttpResponse.json(null, { status: 500 }), { once: true }),
    );
    await expect(getPerson('3')).rejects.toThrow('HTTP 500');

    forgetPerson('3');

    await expect(getPerson('3')).resolves.toMatchObject({ name: 'R2-D2' });
  });
});
