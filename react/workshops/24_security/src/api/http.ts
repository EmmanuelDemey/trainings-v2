import { getSession } from '../auth/session';
import { apiUrl } from './url';

/** The session is gone and could not be renewed: the user has to log in again. */
export class UnauthorizedError extends Error {
  constructor() {
    super('Your session has expired. Please log in again.');
    this.name = 'UnauthorizedError';
  }
}

/**
 * Renews the access token. Ten requests failing with 401 at once trigger ONE
 * refresh: they all wait for the same promise.
 */
export function refreshAccessToken(): Promise<string | null> {
  // TODO 5.2: call `refreshRequest()` ('./auth'): with a token, `setSession(token)`;
  //   without, `clearSession()`. Keep the promise in a module variable while it
  //   runs (`refreshing ??= …`), and reset it in a `.finally`: concurrent callers
  //   share it.
  return Promise.resolve(null);
}

/**
 * `fetch`, authenticated: the access token goes in the `Authorization` header.
 * On a 401, the token is refreshed once and the request replayed; if that fails
 * too, the session is cleared and an `UnauthorizedError` thrown.
 */
export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  // TODO 5.1: copy `init.headers` into `new Headers(…)`, and set
  //   `Authorization: Bearer <token>` when `getSession().accessToken` is set.
  // TODO 5.3: on a 401, `await refreshAccessToken()`; no token → throw
  //   `new UnauthorizedError()`. Otherwise replay the request with the new
  //   token; a second 401 → `clearSession()` and throw.
  void getSession;
  return fetch(apiUrl(path), init);
}

/** `authFetch` + JSON + HTTP errors as exceptions, for the loaders. */
export async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await authFetch(path, { signal });
  if (!response.ok) throw new Error(`Request failed: ${path} (HTTP ${response.status})`);
  return (await response.json()) as T;
}
