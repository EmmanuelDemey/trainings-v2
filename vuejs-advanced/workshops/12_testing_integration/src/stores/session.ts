import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { login as apiLogin, type Session } from '@/api/client';

const STORAGE_KEY = 'desk.session';

/** A corrupted entry must not take the app down on startup. */
function restore(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === null ? null : (JSON.parse(raw) as Session);
  } catch {
    return null;
  }
}

export const useSessionStore = defineStore('session', () => {
  const session = ref<Session | null>(restore());
  const error = ref<string | null>(null);
  const pending = ref(false);

  const isAuthenticated = computed(() => session.value !== null);
  const agentName = computed(() => session.value?.agent.name ?? null);

  // Persisted on purpose: it is what lets a reload — and `cy.session` — keep an
  // agent signed in.
  watch(
    session,
    (value) => {
      try {
        if (value === null) localStorage.removeItem(STORAGE_KEY);
        else localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      } catch {
        // A private window with storage blocked: stay signed in for this tab.
      }
    },
    { deep: true },
  );

  async function signIn(email: string, password: string): Promise<boolean> {
    pending.value = true;
    error.value = null;
    try {
      session.value = await apiLogin(email, password);
      return true;
    } catch {
      error.value = 'Those credentials do not match an agent.';
      return false;
    } finally {
      pending.value = false;
    }
  }

  function signOut(): void {
    session.value = null;
  }

  return { session, error, pending, isAuthenticated, agentName, signIn, signOut };
});
