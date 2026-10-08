export interface Invoice {
  id: number;
  customer: string;
  total: number;
  status: 'paid' | 'pending' | 'late';
}

/**
 * A thin `fetch` wrapper. The point of keeping it thin is that tests can mock
 * either THIS module (fast, coupled to our abstraction) or the NETWORK it uses
 * (slower, closer to reality) — this workshop mocks the network, with MSW.
 */
async function request<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return (await response.json()) as T;
}

export const api = {
  getInvoices: (): Promise<Invoice[]> => request<Invoice[]>('/api/invoices'),
};
