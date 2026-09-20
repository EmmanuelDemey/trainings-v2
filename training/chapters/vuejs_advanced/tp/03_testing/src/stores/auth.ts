import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { api, type Credentials, type Session } from '@/api/client';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<Session['user'] | null>(null);
  const token = ref<string | null>(null);

  const isAuthenticated = computed(() => user.value !== null);

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
