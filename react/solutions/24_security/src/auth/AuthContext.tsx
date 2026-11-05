import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { loginRequest, logoutRequest } from '../api/auth';
import type { User } from '../model/user';
import { clearSession, getSession, setSession, subscribe } from './session';

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
  const { user } = useSyncExternalStore(subscribe, getSession);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login: async (username, password) => setSession(await loginRequest(username, password)),
      logout: async () => {
        // Forget the token locally even if the API is down.
        clearSession();
        await logoutRequest();
      },
    }),
    [user],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside an <AuthProvider>');
  return value;
}
