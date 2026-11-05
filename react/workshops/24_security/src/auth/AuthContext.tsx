import { createContext, useContext, type ReactNode } from 'react';
import type { User } from '../model/user';

interface AuthContextValue {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * The session itself lives in `session.ts`, outside React: the loaders and
 * `authFetch` need it too, and they run outside any component. The provider
 * SUBSCRIBES to it, and gives the components the user and the actions.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // TODO 2.1: `const { user } = useSyncExternalStore(subscribe, getSession)`
  //   (from './session'): the provider re-renders when the session changes.
  // TODO 2.2: a memoised value:
  //   - `login`: `setSession(await loginRequest(username, password))` ('../api/auth')
  //   - `logout`: `clearSession()` FIRST, then `await logoutRequest()`
  const value: AuthContextValue = {
    user: null,
    login: async () => {
      throw new Error('TODO 2.2: login is not written yet');
    },
    logout: async () => {},
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside an <AuthProvider>');
  return value;
}
