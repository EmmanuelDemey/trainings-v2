import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { createPinia, setActivePinia } from 'pinia';
import { useSessionStore } from '@/stores/session';
import { server } from './msw';
import { session } from './fixtures';
import { flushPromises, mountApp } from './helpers';

/**
 * The network, mocked one layer lower than `vi.mock`: MSW intercepts the request
 * itself, so the app's own `fetch` code runs — the URL, the method, the JSON
 * parsing, the status handling. A module mock would have skipped all of it.
 *
 * The happy path is the default (`tests/msw.ts`); each unhappy path is one
 * `server.use()` away, and `setup.ts` resets them after every test.
 */

/** Signed in, on a fresh pinia — the queue is behind the guard. */
async function openQueue() {
  const pinia = createPinia();
  setActivePinia(pinia);
  useSessionStore().session = session;

  const app = await mountApp('/tickets', pinia);
  await flushPromises();
  return app;
}

describe('the queue', () => {
  it('lists what the API returns', async () => {
    using app = await openQueue();

    expect(app.wrapper.findAll('[data-testid="ticket-row"]')).toHaveLength(3);
    expect(app.wrapper.get('[data-testid="open-count"]').text()).toContain('2 open');
  });

  it('says the queue is empty rather than rendering an empty table', async () => {
    server.use(http.get('/api/tickets', () => HttpResponse.json([])));

    using app = await openQueue();

    expect(app.wrapper.get('[data-testid="empty"]').text()).toContain('Nothing in the queue');
    expect(app.wrapper.find('table').exists()).toBe(false);
  });

  it('reports a failure instead of showing a stale list', async () => {
    server.use(http.get('/api/tickets', () => new HttpResponse(null, { status: 500 })));

    using app = await openQueue();

    expect(app.wrapper.get('[data-testid="error"]').text()).toContain('could not be loaded');
    expect(app.wrapper.findAll('[data-testid="ticket-row"]')).toHaveLength(0);
  });
});

describe('closing a ticket', () => {
  it('reflects the new status once the API confirms it', async () => {
    using app = await openQueue();

    await app.wrapper.findAll('[data-testid="close-ticket"]')[0]!.trigger('click');
    await flushPromises();

    const firstRow = app.wrapper.findAll('[data-testid="ticket-row"]')[0]!;
    expect(firstRow.get('[data-testid="ticket-status"]').text()).toBe('closed');
  });
});
