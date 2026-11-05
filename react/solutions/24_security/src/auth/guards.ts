import { data, redirect } from 'react-router';
import { refreshAccessToken } from '../api/http';
import type { Role, User } from '../model/user';
import { getSession } from './session';

/**
 * Only a path of THIS app: `/people/1` yes, `https://evil.example` or
 * `//evil.example` no. Otherwise `?redirectTo=` is an open redirect: a phishing
 * link on your own domain that lands on the attacker's.
 */
export function safeRedirect(to: string | null, fallback = '/'): string {
  if (!to || !to.startsWith('/') || to.startsWith('//') || to.startsWith('/\\')) return fallback;
  return to;
}

/**
 * For the loaders of the protected routes: the logged-in user, or a redirect to
 * the login page that remembers where to come back to. After a reload there is
 * no token in memory: try a refresh first.
 */
export async function requireUser(request: Request): Promise<User> {
  if (!getSession().user) await refreshAccessToken();
  const { user } = getSession();
  if (!user) {
    const { pathname, search } = new URL(request.url);
    throw redirect(`/login?redirectTo=${encodeURIComponent(pathname + search)}`);
  }
  return user;
}

/**
 * The user, if they have `role`; a 403 otherwise. This is UX, not security:
 * anyone can edit the JavaScript. The API checks the role again.
 */
export async function requireRole(request: Request, role: Role): Promise<User> {
  const user = await requireUser(request);
  if (user.role !== role) throw data('This page is for administrators only.', { status: 403 });
  return user;
}
