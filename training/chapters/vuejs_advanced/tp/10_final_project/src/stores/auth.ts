import { defineStore, acceptHMRUpdate } from 'pinia';
import { computed, ref } from 'vue';
import { login as apiLogin, me as apiMe, type User } from '@/api/fakeApi';

const TOKEN_KEY = 'tp10:token';

/**
 * The auth store is provided and working — chapter 5 already covered it. Read
 * it anyway: every guard you write leans on `restoreSession()` and `hasRole()`.
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY));

  /** `false` until we know whether the stored token is still valid. */
  const initialized = ref(false);

  const isAuthenticated = computed(() => user.value !== null);
  const roles = computed(() => user.value?.roles ?? []);

  function hasRole(role: 'admin' | 'accountant'): boolean {
    return roles.value.includes(role);
  }

  async function login(email: string, password: string): Promise<void> {
    const result = await apiLogin(email, password);
    token.value = result.token;
    user.value = result.user;
    localStorage.setItem(TOKEN_KEY, result.token);
    initialized.value = true;
  }

  /** Idempotent: the guard calls it before every navigation. */
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
