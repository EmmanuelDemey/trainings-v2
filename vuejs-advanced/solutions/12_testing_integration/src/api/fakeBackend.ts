/**
 * The dev/preview backend: it patches `window.fetch` and answers `/api/*` before
 * a request ever leaves the page.
 *
 * It **steps aside under Cypress** (see `main.ts`). It listens on the exact layer
 * `cy.intercept` listens on, so leaving it installed would mean every
 * `cy.wait('@tickets')` fails with "No request ever occurred" — because none did.
 */
import type { Session, Ticket } from './client';

const TICKETS: Ticket[] = [
  { id: 1, subject: 'Card declined on renewal', requester: 'ada@northwind.io', priority: 'urgent', status: 'open' },
  { id: 2, subject: 'CSV export truncates names', requester: 'grace@aperture.dev', priority: 'normal', status: 'open' },
  { id: 3, subject: 'SSO loops on consent', requester: 'linus@monolith.fr', priority: 'urgent', status: 'pending' },
  { id: 4, subject: 'Weekly digest counts deleted items', requester: 'alan@enigma.uk', priority: 'low', status: 'closed' },
];

const LATENCY_MS = 250;

function respond(body: unknown, status = 200): Promise<Response> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }));
    }, LATENCY_MS);
  });
}

export function installFakeBackend(): void {
  const realFetch = window.fetch.bind(window);

  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

    if (!url.startsWith('/api/')) return realFetch(input as RequestInfo, init);

    if (url === '/api/session' && init?.method === 'POST') {
      const body = JSON.parse(String(init.body)) as { email: string; password: string };
      if (body.email === 'ada@acme.dev' && body.password === 'secret') {
        const session: Session = { token: 'token-1', agent: { id: 1, name: 'Ada Lovelace' } };
        return respond(session);
      }
      return respond({ message: 'Bad credentials' }, 401);
    }

    if (url === '/api/tickets') return respond(TICKETS);

    const close = /^\/api\/tickets\/(\d+)\/close$/.exec(url);
    if (close && init?.method === 'POST') {
      const ticket = TICKETS.find((t) => t.id === Number(close[1]));
      if (!ticket) return respond({ message: 'Not found' }, 404);
      ticket.status = 'closed';
      return respond(ticket);
    }

    const one = /^\/api\/tickets\/(\d+)$/.exec(url);
    if (one) {
      const ticket = TICKETS.find((t) => t.id === Number(one[1]));
      return ticket ? respond(ticket) : respond({ message: 'Not found' }, 404);
    }

    return respond({ message: 'Not found' }, 404);
  };
}
