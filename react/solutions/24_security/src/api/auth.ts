import { apiUrl } from './url';

/**
 * `credentials: 'include'` sends the cookies — the refresh token, in a real
 * API, is an `HttpOnly` cookie the browser attaches by itself.
 */
const withCookies: RequestInit = { method: 'POST', credentials: 'include' };

/** Logs in; resolves with the access token, rejects with the API's message. */
export async function loginRequest(username: string, password: string): Promise<string> {
  const response = await fetch(apiUrl('/api/auth/login'), {
    ...withCookies,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const body = (await response.json()) as { accessToken?: string; message?: string };
  if (!response.ok || !body.accessToken) throw new Error(body.message ?? `Login failed (HTTP ${response.status})`);
  return body.accessToken;
}

/** A new access token from the refresh session, or `null` when there is none. */
export async function refreshRequest(): Promise<string | null> {
  const response = await fetch(apiUrl('/api/auth/refresh'), withCookies);
  if (!response.ok) return null;
  return ((await response.json()) as { accessToken: string }).accessToken;
}

/** Ends the refresh session on the API side. */
export async function logoutRequest(): Promise<void> {
  await fetch(apiUrl('/api/auth/logout'), withCookies);
}
