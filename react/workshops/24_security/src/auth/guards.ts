import type { Role, User } from '../model/user';
import { getSession } from './session';

/**
 * Only a path of THIS app: `/people/1` yes, `https://evil.example` or
 * `//evil.example` no. Otherwise `?redirectTo=` is an open redirect: a phishing
 * link on your own domain that lands on the attacker's.
 */
export function safeRedirect(to: string | null, fallback = '/'): string {
  // TODO 4.1: return `fallback` unless `to` starts with '/' — and not with '//'
  //   nor '/\' (browsers read both as "another host").
  return to ?? fallback;
}

/**
 * For the loaders of the protected routes: the logged-in user, or a redirect to
 * the login page that remembers where to come back to. After a reload there is
 * no token in memory: try a refresh first.
 */
export async function requireUser(request: Request): Promise<User> {
  // TODO 3.1: no user in the session? `await refreshAccessToken()` ('../api/http').
  // TODO 3.2: still none? `throw redirect('/login?redirectTo=…')` (from
  //   'react-router'), with the pathname + search of `request.url`, encoded
  //   with `encodeURIComponent`.
  void request;
  return getSession().user as User;
}

/**
 * The user, if they have `role`; a 403 otherwise. This is UX, not security:
 * anyone can edit the JavaScript. The API checks the role again.
 */
export async function requireRole(request: Request, role: Role): Promise<User> {
  // TODO 3.4: `requireUser` first; then, for another role,
  //   `throw data('This page is for administrators only.', { status: 403 })`.
  void role;
  return requireUser(request);
}
