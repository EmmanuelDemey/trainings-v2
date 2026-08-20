import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import { api, type Credentials, type Session } from '@/api/client';

const STORAGE_KEY = 'tp4:session';

/**
 * Reads the persisted session, tolerating anything that is not valid JSON.
 * localStorage is user-writable: a corrupted entry must log the user out, never
 * crash the app on boot.
 */
function readStoredSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export const useAuthStore = defineStore('auth', () => {
  const stored = readStoredSession();

  const user = ref<Session['user'] | null>(stored?.user ?? null);
  const token = ref<string | null>(stored?.token ?? null);

  const isAuthenticated = computed(() => user.value !== null);

  /**
   * Persisting the session is what makes `cy.session` useful.
   *
   * `cy.session` snapshots and restores cookies, localStorage and
   * sessionStorage — nothing else. A session kept only in a Pinia ref lives in
   * the JS heap of one page, and every `cy.visit` starts a fresh one: there
   * would be nothing for Cypress to restore, and the "cached" session would log
   * you out on the first navigation.
   *
   * The trade-off is real and worth stating out loud: a token in localStorage is
   * readable by any script that runs on the page, so an XSS becomes a token
   * theft. The alternative — an httpOnly, SameSite cookie set by the server — is
   * what you want in production; it is also invisible to JavaScript, which is
   * why a workshop with a fake in-browser backend cannot use it.
   */
  watch(
    [user, token],
    ([currentUser, currentToken]) => {
      if (currentUser && currentToken) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: currentUser, token: currentToken }));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    },
    { deep: true },
  );

  async function login(credentials: Credentials): Promise<void> {
    const session = await api.login(credentials);
    token.value = session.token;
    user.value = session.user;
  }

  function logout(): void {
    user.value = null;
    token.value = null;
  }

  return { user, token, isAuthenticated, login, logout };
});
