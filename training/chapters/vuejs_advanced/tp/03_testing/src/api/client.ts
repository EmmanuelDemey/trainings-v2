export interface Invoice {
  id: number;
  customer: string;
  total: number;
  status: 'paid' | 'pending' | 'late';
}

export interface Credentials {
  email: string;
  password: string;
}

export interface Session {
  token: string;
  user: { id: number; name: string };
}

/**
 * A thin `fetch` wrapper. The point of keeping it thin is that tests can mock
 * either THIS module (fast, coupled to our abstraction) or the NETWORK it uses
 * (slower, closer to reality) — you will do both.
 */
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return (await response.json()) as T;
}

export const api = {
  getInvoices: (): Promise<Invoice[]> => request<Invoice[]>('/api/invoices'),

  getInvoice: (id: number): Promise<Invoice> => request<Invoice>(`/api/invoices/${id}`),

  login: (credentials: Credentials): Promise<Session> =>
    request<Session>('/api/login', { method: 'POST', body: JSON.stringify(credentials) }),
};
