import { describe, expect, it, vi } from 'vitest';
import { signToken } from '../mocks/tokens';
import { clearSession, getSession, setSession, subscribe } from './session';

const luke = { id: 'u1', name: 'Luke Skywalker', role: 'user' as const };

describe('the session', () => {
  it('reads the user from the access token', () => {
    setSession(signToken(luke));

    expect(getSession().user).toEqual(luke);
  });

  it('keeps the token in memory only — never in localStorage', () => {
    const token = signToken(luke);

    setSession(token);

    expect(getSession().accessToken).toBe(token);
    expect(Object.values(window.localStorage)).not.toContain(token);
    expect(JSON.stringify(window.sessionStorage)).not.toContain(token);
  });

  it('notifies its subscribers, and stops after unsubscribing', () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);

    setSession(signToken(luke));
    clearSession();
    unsubscribe();
    setSession(signToken(luke));

    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('returns the same object until something changes — useSyncExternalStore relies on it', () => {
    setSession(signToken(luke));

    expect(getSession()).toBe(getSession());
  });
});
