import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { session, tickets } from './fixtures';

/**
 * The DEFAULT handlers: the happy path, and nothing else. Individual tests
 * override them with `server.use(...)` for the empty, error and slow cases —
 * `afterEach` in `setup.ts` puts these back.
 */
export const handlers = [
  http.get('/api/tickets', () => HttpResponse.json(tickets)),

  http.get('/api/tickets/:id', ({ params }) => {
    const ticket = tickets.find((t) => t.id === Number(params.id));
    return ticket ? HttpResponse.json(ticket) : new HttpResponse(null, { status: 404 });
  }),

  http.post('/api/tickets/:id/close', ({ params }) => {
    const ticket = tickets.find((t) => t.id === Number(params.id));
    return ticket ? HttpResponse.json({ ...ticket, status: 'closed' }) : new HttpResponse(null, { status: 404 });
  }),

  http.post('/api/session', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    return body.email === 'ada@acme.dev' && body.password === 'secret'
      ? HttpResponse.json(session)
      : new HttpResponse(null, { status: 401 });
  }),
];

export const server = setupServer(...handlers);
