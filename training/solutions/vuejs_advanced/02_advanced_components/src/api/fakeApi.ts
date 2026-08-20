/**
 * In-memory fake API. Adds an artificial latency so loading states are visible,
 * and can be told to fail so error paths can be exercised.
 */

export interface Invoice {
  id: number;
  customer: string;
  total: number;
  status: 'paid' | 'pending' | 'late';
  issuedAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface SalesPoint {
  month: string;
  amount: number;
}

const CUSTOMERS = ['Acme', 'Globex', 'Initech', 'Umbrella', 'Hooli', 'Soylent'];
const STATUSES: Invoice['status'][] = ['paid', 'pending', 'late'];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Deterministic pseudo-random, so two runs render the same data. */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10_000;
  return x - Math.floor(x);
}

export function makeInvoices(count: number): Invoice[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    customer: CUSTOMERS[i % CUSTOMERS.length]!,
    total: Math.round(pseudoRandom(i + 1) * 500_00) / 100,
    status: STATUSES[i % STATUSES.length]!,
    issuedAt: new Date(2025, i % 12, (i % 27) + 1).toISOString().slice(0, 10),
  }));
}

/** Flip to `true` in the devtools console to exercise the error components. */
export const failureSwitch = { chart: false, profile: false };

export async function fetchSales(): Promise<SalesPoint[]> {
  await delay(900);
  if (failureSwitch.chart) throw new Error('Failed to fetch dynamically imported module');

  return Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2025, i, 1).toLocaleString('en', { month: 'short' }),
    amount: Math.round(pseudoRandom(i + 100) * 90_000) + 10_000,
  }));
}

export async function fetchUser(id: number): Promise<User> {
  await delay(1200);
  if (failureSwitch.profile) throw new Error(`User ${id} is unavailable`);

  return {
    id,
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    role: 'admin',
  };
}

export async function fetchInvoices(count = 25): Promise<Invoice[]> {
  await delay(400);
  return makeInvoices(count);
}
