/**
 * In-memory fake backend for the final project.
 *
 * Two accounts, a handful of invoices, an artificial latency, `AbortSignal`
 * support on the reads, and a switch that makes the next write fail — because
 * an optimistic update you never saw roll back is an optimistic update you have
 * not written yet.
 *
 * This file is provided and complete. You are not expected to change it.
 */

export interface User {
  id: number;
  name: string;
  email: string;
  roles: Array<'admin' | 'accountant'>;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'late';

export interface Invoice {
  id: number;
  /** Human-readable reference, `INV-1234`. Unique. */
  number: string;
  customer: string;
  /** In euros, two decimals at most. */
  amount: number;
  status: InvoiceStatus;
  /** ISO date, `YYYY-MM-DD`. */
  dueDate: string;
}

export type NewInvoice = Omit<Invoice, 'id' | 'status'>;

/** A validation error the *server* raised, pointing at the field to blame. */
export class ApiFieldError extends Error {
  constructor(
    readonly field: keyof NewInvoice,
    message: string,
  ) {
    super(message);
    this.name = 'ApiFieldError';
  }
}

const ACCOUNTS: Array<{ email: string; password: string; user: User }> = [
  {
    email: 'ada@example.com',
    password: 'admin',
    user: { id: 1, name: 'Ada Lovelace', email: 'ada@example.com', roles: ['admin', 'accountant'] },
  },
  {
    email: 'alan@example.com',
    password: 'user',
    user: { id: 2, name: 'Alan Turing', email: 'alan@example.com', roles: ['accountant'] },
  },
];

let nextId = 6;
const INVOICES: Invoice[] = [
  { id: 1, number: 'INV-1001', customer: 'Acme', amount: 1240.5, status: 'paid', dueDate: '2026-01-31' },
  { id: 2, number: 'INV-1002', customer: 'Globex', amount: 89.9, status: 'sent', dueDate: '2026-02-15' },
  { id: 3, number: 'INV-1003', customer: 'Initech', amount: 4300, status: 'late', dueDate: '2025-12-01' },
  { id: 4, number: 'INV-1004', customer: 'Umbrella', amount: 615.2, status: 'draft', dueDate: '2026-03-10' },
  { id: 5, number: 'INV-1005', customer: 'Hooli', amount: 78, status: 'sent', dueDate: '2026-02-28' },
];

function abortError(): DOMException {
  return new DOMException('The operation was aborted.', 'AbortError');
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(abortError());
      },
      { once: true },
    );
  });
}

/* -------------------------------------------------------------------------- */
/* Failure switch — flipped from the UI (top-right checkbox)                   */
/* -------------------------------------------------------------------------- */

let failWrites = false;

export function setFailWrites(value: boolean): void {
  failWrites = value;
}

export function getFailWrites(): boolean {
  return failWrites;
}

/* -------------------------------------------------------------------------- */
/* Auth                                                                        */
/* -------------------------------------------------------------------------- */

/** Tokens are just `token-<userId>` — this is a fake backend, not a lesson in JWT. */
export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  await delay(500);
  const account = ACCOUNTS.find((a) => a.email === email && a.password === password);
  if (!account) throw new Error('Invalid email or password');
  return { token: `token-${account.user.id}`, user: account.user };
}

export async function me(token: string): Promise<User> {
  await delay(300);
  const id = Number(token.replace('token-', ''));
  const account = ACCOUNTS.find((a) => a.user.id === id);
  if (!account) throw new Error('Invalid token');
  return account.user;
}

/* -------------------------------------------------------------------------- */
/* Invoices                                                                    */
/* -------------------------------------------------------------------------- */

export async function fetchInvoices(signal?: AbortSignal): Promise<Invoice[]> {
  await delay(400, signal);
  return INVOICES.map((invoice) => ({ ...invoice }));
}

export async function fetchInvoice(id: number, signal?: AbortSignal): Promise<Invoice> {
  await delay(350, signal);
  const invoice = INVOICES.find((i) => i.id === id);
  if (!invoice) throw new Error(`Invoice ${id} not found`);
  return { ...invoice };
}

export async function updateInvoiceStatus(id: number, status: InvoiceStatus): Promise<Invoice> {
  await delay(600);
  if (failWrites) throw new Error('The billing service is unavailable (503)');

  const invoice = INVOICES.find((i) => i.id === id);
  if (!invoice) throw new Error(`Invoice ${id} not found`);
  invoice.status = status;
  return { ...invoice };
}

export async function createInvoice(input: NewInvoice): Promise<Invoice> {
  await delay(700);
  if (failWrites) throw new Error('The billing service is unavailable (503)');

  // The server validates too — and it knows things the client cannot, such as
  // which references already exist.
  if (INVOICES.some((i) => i.number === input.number)) {
    throw new ApiFieldError('number', `Reference ${input.number} already exists`);
  }

  const invoice: Invoice = { id: nextId++, status: 'draft', ...input };
  INVOICES.push(invoice);
  return { ...invoice };
}
