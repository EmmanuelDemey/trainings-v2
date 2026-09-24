import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import type { Invoice } from '@/api/client';

/** The shared dataset: the same three invoices the dev server's fake backend serves. */
export const invoices: Invoice[] = [
  { id: 1, customer: 'Acme', total: 1240.5, status: 'paid' },
  { id: 2, customer: 'Globex', total: 89.9, status: 'pending' },
  { id: 3, customer: 'Initech', total: 4300, status: 'late' },
];

/**
 * The DEFAULT handlers: the happy path, which every test in this workshop
 * relies on.
 */
export const handlers = [
  http.get('/api/invoices', () => HttpResponse.json(invoices)),
];

export const server = setupServer(...handlers);
