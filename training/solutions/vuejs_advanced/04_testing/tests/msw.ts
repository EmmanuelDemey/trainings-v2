import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { invoices } from './fixtures';

// Re-exported so the tests that already import it from here keep working. The
// array itself lives in `fixtures.ts`, which the browser mode demo can import
// without dragging `msw/node` into the browser.
export { invoices };

/**
 * The DEFAULT handlers: the happy path. Individual tests override them with
 * `server.use(...)` for the empty, error and slow cases.
 */
export const handlers = [
  http.get('/api/invoices', () => HttpResponse.json(invoices)),

  http.get('/api/invoices/:id', ({ params }) => {
    const invoice = invoices.find((i) => i.id === Number(params.id));
    return invoice ? HttpResponse.json(invoice) : new HttpResponse(null, { status: 404 });
  }),

  http.post('/api/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    if (body.email === 'ada@example.com' && body.password === 'secret') {
      return HttpResponse.json({ token: 'token-1', user: { id: 1, name: 'Ada Lovelace' } });
    }
    return new HttpResponse(null, { status: 401 });
  }),
];

export const server = setupServer(...handlers);
