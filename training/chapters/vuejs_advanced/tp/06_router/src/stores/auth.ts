import { defineStore, acceptHMRUpdate } from 'pinia';
import { computed, ref } from 'vue';
import { login as apiLogin, me as apiMe, type User } from '@/api/fakeApi';

const TOKEN_KEY = 'tp4:token';

/**
 * The auth store is provided and working — the exercise is in the router, not
 * here. Read it, because every guard you write leans on it.
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY));

  /** `false` until we know whether the stored token is still valid. */
  const initialized = ref(false);

  const isAuthenticated = computed(() => user.value !== null);
  const roles = computed(() => user.value?.roles ?? []);

  function hasRole(role: 'admin' | 'user'): boolean {
    return roles.value.includes(role);
  }

  async function login(email: string, password: string): Promise<void> {
    const result = await apiLogin(email, password);
    token.value = result.token;
    user.value = result.user;
    localStorage.setItem(TOKEN_KEY, result.token);
    initialized.value = true;
  }

  /**
   * Called by the guard before the first protected navigation. Without it, a
   * hard refresh on a protected page bounces the user to /login even though the
   * token is still valid.
   */
  async function restoreSession(): Promise<void> {
    if (initialized.value) return;

    if (token.value) {
      try {
        user.value = await apiMe(token.value);
      } catch {
        logout();
      }
    }
    initialized.value = true;
  }

  function logout(): void {
    user.value = null;
    token.value = null;
    localStorage.removeItem(TOKEN_KEY);
  }

  return { user, token, initialized, isAuthenticated, roles, hasRole, login, restoreSession, logout };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
