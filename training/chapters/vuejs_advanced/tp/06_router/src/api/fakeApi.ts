/**
 * In-memory fake backend: two accounts, a handful of invoices, and an
 * artificial latency so guards and loading states behave like the real thing.
 */

export interface User {
  id: number;
  name: string;
  email: string;
  roles: Array<'admin' | 'user'>;
}

export interface Invoice {
  id: number;
  customer: string;
  total: number;
  status: 'paid' | 'pending' | 'late';
}

const ACCOUNTS: Array<{ email: string; password: string; user: User }> = [
  {
    email: 'ada@example.com',
    password: 'admin',
    user: { id: 1, name: 'Ada Lovelace', email: 'ada@example.com', roles: ['admin', 'user'] },
  },
  {
    email: 'alan@example.com',
    password: 'user',
    user: { id: 2, name: 'Alan Turing', email: 'alan@example.com', roles: ['user'] },
  },
];

const INVOICES: Invoice[] = [
  { id: 1, customer: 'Acme', total: 1240.5, status: 'paid' },
  { id: 2, customer: 'Globex', total: 89.9, status: 'pending' },
  { id: 3, customer: 'Initech', total: 4300, status: 'late' },
  { id: 4, customer: 'Umbrella', total: 615.2, status: 'paid' },
  { id: 5, customer: 'Hooli', total: 78, status: 'pending' },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Tokens are just `token-<userId>` — this is a fake backend, not a lesson in JWT. */
export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  await delay(600);
  const account = ACCOUNTS.find((a) => a.email === email && a.password === password);
  if (!account) throw new Error('Invalid email or password');
  return { token: `token-${account.user.id}`, user: account.user };
}

export async function me(token: string): Promise<User> {
  await delay(400);
  const id = Number(token.replace('token-', ''));
  const account = ACCOUNTS.find((a) => a.user.id === id);
  if (!account) throw new Error('Invalid token');
  return account.user;
}

export async function fetchInvoices(): Promise<Invoice[]> {
  await delay(300);
  return [...INVOICES];
}

export async function fetchInvoice(id: number): Promise<Invoice> {
  await delay(300);
  const invoice = INVOICES.find((i) => i.id === id);
  if (!invoice) throw new Error(`Invoice ${id} not found`);
  return { ...invoice };
}
