import type { Invoice } from '@/api/client';

/**
 * The shared dataset, used by the MSW handlers (jsdom tests) and by the browser
 * mode demo. It lives in its own module because `tests/msw.ts` imports
 * `msw/node`, which cannot be loaded inside a browser.
 */
export const invoices: Invoice[] = [
  { id: 1, customer: 'Acme', total: 1240.5, status: 'paid' },
  { id: 2, customer: 'Globex', total: 89.9, status: 'pending' },
  { id: 3, customer: 'Initech', total: 4300, status: 'late' },
];
