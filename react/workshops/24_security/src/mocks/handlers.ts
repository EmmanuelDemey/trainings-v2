import { delay, http, HttpResponse } from 'msw';
import { people } from '../data/people';
import { accounts } from '../data/users';
import type { User } from '../model/user';
import { signToken, verifyToken } from './tokens';

async function latency(): Promise<void> {
  if (import.meta.env.MODE !== 'test') await delay(300);
}

/**
 * The refresh session, on the SERVER side. A real API puts the refresh token in
 * an `HttpOnly; Secure; SameSite=Strict` cookie: the browser sends it, but no
 * JavaScript — yours or an attacker's — can read it. Here, the fake API keeps it.
 */
let refreshSession: User | null = null;

/** Forgets the refresh session: the specs call it between tests. */
export function resetMockSessions(): void {
  refreshSession = null;
}

function userFrom(request: Request): User | null {
  const header = request.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) return null;
  return verifyToken(header.slice('Bearer '.length));
}

const unauthorized = () => HttpResponse.json({ message: 'Not authenticated' }, { status: 401 });
const forbidden = () => HttpResponse.json({ message: 'Forbidden' }, { status: 403 });

export const handlers = [
  http.post('/api/auth/login', async ({ request }) => {
    await latency();
    const { username, password } = (await request.json()) as { username: string; password: string };
    const account = accounts.find((candidate) => candidate.username === username && candidate.password === password);
    // The same message for an unknown user and a wrong password: do not tell an
    // attacker which usernames exist.
    if (!account) return HttpResponse.json({ message: 'Invalid username or password' }, { status: 401 });
    const user: User = { id: account.id, name: account.name, role: account.role };
    refreshSession = user;
    return HttpResponse.json({ accessToken: signToken(user) });
  }),

  http.post('/api/auth/refresh', async () => {
    await latency();
    if (!refreshSession) return unauthorized();
    return HttpResponse.json({ accessToken: signToken(refreshSession) });
  }),

  http.post('/api/auth/logout', () => {
    refreshSession = null;
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('/api/people', async ({ request }) => {
    await latency();
    if (!userFrom(request)) return unauthorized();
    return HttpResponse.json(people.map(({ id, name }) => ({ id, name })));
  }),

  http.get('/api/people/:id', async ({ request, params }) => {
    await latency();
    if (!userFrom(request)) return unauthorized();
    const person = people.find(({ id }) => id === params.id);
    if (!person) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json(person);
  }),

  // The real protection: the SERVER checks the role, whatever the UI shows.
  http.get('/api/admin/stats', async ({ request }) => {
    await latency();
    const user = userFrom(request);
    if (!user) return unauthorized();
    if (user.role !== 'admin') return forbidden();
    return HttpResponse.json({ people: people.length, accounts: accounts.length });
  }),
];
