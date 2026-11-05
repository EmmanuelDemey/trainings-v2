import { clearSession, getSession, setSession } from '../auth/session';
import { refreshRequest } from './auth';
import { apiUrl } from './url';

/** The session is gone and could not be renewed: the user has to log in again. */
export class UnauthorizedError extends Error {
  constructor() {
    super('Your session has expired. Please log in again.');
    this.name = 'UnauthorizedError';
  }
}

/** The refresh in progress, shared by every request that needs it. */
let refreshing: Promise<string | null> | null = null;

/**
 * Renews the access token. Ten requests failing with 401 at once trigger ONE
 * refresh: they all wait for the same promise.
 */
export function refreshAccessToken(): Promise<string | null> {
  refreshing ??= refreshRequest()
    .then((token) => {
      if (token) setSession(token);
      else clearSession();
      return token;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

function send(path: string, init: RequestInit, token: string | null): Promise<Response> {
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(apiUrl(path), { ...init, headers });
}

/**
 * `fetch`, authenticated: the access token goes in the `Authorization` header.
 * On a 401, the token is refreshed once and the request replayed; if that fails
 * too, the session is cleared and an `UnauthorizedError` thrown.
 */
export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const response = await send(path, init, getSession().accessToken);
  if (response.status !== 401) return response;

  const token = await refreshAccessToken();
  if (!token) throw new UnauthorizedError();

  const retried = await send(path, init, token);
  if (retried.status === 401) {
    clearSession();
    throw new UnauthorizedError();
  }
  return retried;
}

/** `authFetch` + JSON + HTTP errors as exceptions, for the loaders. */
export async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await authFetch(path, { signal });
  if (!response.ok) throw new Error(`Request failed: ${path} (HTTP ${response.status})`);
  return (await response.json()) as T;
}
