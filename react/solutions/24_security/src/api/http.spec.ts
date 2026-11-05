import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { getSession, setSession } from '../auth/session';
import { server } from '../mocks/server';
import { signToken } from '../mocks/tokens';
import { authFetch, UnauthorizedError } from './http';
import { loginRequest } from './auth';

const luke = { id: 'u1', name: 'Luke Skywalker', role: 'user' as const };

/** A token the API refuses: expired five minutes ago. */
const expiredToken = () => signToken(luke, { now: Date.now() - 10 * 60_000, expiresIn: 300 });

describe('authFetch', () => {
  it('sends the access token as a Bearer token', async () => {
    const token = signToken(luke);
    setSession(token);
    let header: string | null = null;
    server.use(
      http.get('/api/echo', ({ request }) => {
        header = request.headers.get('Authorization');
        return HttpResponse.json({});
      }),
    );

    await authFetch('/api/echo');

    expect(header).toBe(`Bearer ${token}`);
  });

  it('refreshes the token on a 401, then replays the request', async () => {
    await loginRequest('luke', 'usetheforce'); // opens a refresh session on the API
    setSession(expiredToken());

    const response = await authFetch('/api/people');

    expect(response.status).toBe(200);
    expect(getSession().accessToken).not.toBeNull();
  });

  it('refreshes ONCE for several requests failing together', async () => {
    await loginRequest('luke', 'usetheforce');
    setSession(expiredToken());
    let refreshes = 0;
    server.events.on('request:start', ({ request }) => {
      if (new URL(request.url).pathname === '/api/auth/refresh') refreshes += 1;
    });

    await Promise.all([authFetch('/api/people'), authFetch('/api/people/1'), authFetch('/api/people/5')]);

    expect(refreshes).toBe(1);
  });

  it('clears the session and throws UnauthorizedError when the refresh fails too', async () => {
    setSession(expiredToken()); // no login: no refresh session on the API

    await expect(authFetch('/api/people')).rejects.toBeInstanceOf(UnauthorizedError);
    expect(getSession().user).toBeNull();
  });

  it('leaves the other errors to the caller', async () => {
    setSession(signToken(luke));

    const response = await authFetch('/api/admin/stats');

    expect(response.status).toBe(403);
  });
});
