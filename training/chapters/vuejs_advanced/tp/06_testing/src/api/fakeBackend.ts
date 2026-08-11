import type { Invoice } from './client';

/**
 * Browser-side fake backend, used by `npm run dev` and `npm run preview` only.
 * Vitest uses MSW instead, and Cypress uses `cy.intercept` — three mechanisms,
 * one contract.
 */
const INVOICES: Invoice[] = [
  { id: 1, customer: 'Acme', total: 1240.5, status: 'paid' },
  { id: 2, customer: 'Globex', total: 89.9, status: 'pending' },
  { id: 3, customer: 'Initech', total: 4300, status: 'late' },
];

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function installFakeBackend(): void {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

    if (!url.startsWith('/api/')) return originalFetch(input, init);

    await new Promise((resolve) => setTimeout(resolve, 300));

    if (url === '/api/invoices') return json(INVOICES);

    if (url.startsWith('/api/invoices/')) {
      const id = Number(url.split('/').pop());
      const invoice = INVOICES.find((i) => i.id === id);
      return invoice ? json(invoice) : new Response(null, { status: 404 });
    }

    if (url === '/api/login') {
      const body = JSON.parse(String(init?.body ?? '{}')) as { email: string; password: string };
      if (body.email === 'ada@example.com' && body.password === 'secret') {
        return json({ token: 'token-1', user: { id: 1, name: 'Ada Lovelace' } });
      }
      return new Response(null, { status: 401 });
    }

    return new Response(null, { status: 404 });
  };
}
