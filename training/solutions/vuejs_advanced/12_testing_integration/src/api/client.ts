/**
 * The only place the app talks to the network. Everything goes through `fetch`,
 * which is what makes all three mocking layers possible: a `vi.mock` of THIS
 * module, an MSW handler under it, or `cy.intercept` under that.
 */

export interface Ticket {
  id: number;
  subject: string;
  requester: string;
  priority: 'low' | 'normal' | 'urgent';
  status: 'open' | 'pending' | 'closed';
}

export interface Session {
  token: string;
  agent: { id: number; name: string };
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function json<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new ApiError(`Request failed with ${response.status}`, response.status);
  }
  return (await response.json()) as T;
}

export async function login(email: string, password: string): Promise<Session> {
  const response = await fetch('/api/session', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return json<Session>(response);
}

export async function fetchTickets(signal?: AbortSignal): Promise<Ticket[]> {
  return json<Ticket[]>(await fetch('/api/tickets', { signal }));
}

export async function fetchTicket(id: number): Promise<Ticket> {
  return json<Ticket>(await fetch(`/api/tickets/${id}`));
}

export async function closeTicket(id: number): Promise<Ticket> {
  return json<Ticket>(await fetch(`/api/tickets/${id}/close`, { method: 'POST' }));
}
