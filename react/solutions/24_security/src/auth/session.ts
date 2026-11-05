import type { User } from '../model/user';
import { decodeJwt } from './jwt';

export interface Session {
  accessToken: string | null;
  user: User | null;
}

const LOGGED_OUT: Session = { accessToken: null, user: null };

/**
 * The access token lives in MEMORY, in this module — not in `localStorage`. An
 * XSS can read `localStorage` and send the token away; it cannot reach a module
 * variable as easily, and the token is gone when the tab closes. A reload loses
 * it too: the refresh token (an HttpOnly cookie, on the API side) gets a new one.
 */
let session: Session = LOGGED_OUT;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

/** The current session — the SAME object until it changes (`useSyncExternalStore` needs it). */
export function getSession(): Session {
  return session;
}

export function setSession(accessToken: string): void {
  const { sub, name, role } = decodeJwt(accessToken);
  session = { accessToken, user: { id: sub, name, role } };
  emit();
}

export function clearSession(): void {
  if (session === LOGGED_OUT) return;
  session = LOGGED_OUT;
  emit();
}

/** Calls `listener` on every change; returns the unsubscribe function. */
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
