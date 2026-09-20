<script setup lang="ts">
/**
 * Depends on the router (redirect after login) and on a store. Step 2 tests it
 * twice: with a real memory router, then with `vi.mock('vue-router')`.
 */
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const email = ref('');
const password = ref('');
const error = ref<string | null>(null);
const pending = ref(false);

const canSubmit = computed(() => email.value.includes('@') && password.value.length >= 4);

function safeRedirect(): string {
  const target = route.query.redirect;
  // Only same-origin relative paths — never trust a redirect from the URL.
  if (typeof target === 'string' && /^\/(?!\/)/.test(target)) return target;
  return '/invoices';
}

async function onSubmit(): Promise<void> {
  if (!canSubmit.value) return;

  error.value = null;
  pending.value = true;
  try {
    await auth.login({ email: email.value, password: password.value });
    await router.replace(safeRedirect());
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <form data-testid="login-form" @submit.prevent="onSubmit">
    <label>Email <input v-model="email" data-testid="email" type="email" /></label>
    <label>Password <input v-model="password" data-testid="password" type="password" /></label>

    <button type="submit" data-testid="submit" :disabled="!canSubmit || pending">
      {{ pending ? 'Signing in…' : 'Sign in' }}
    </button>

    <p v-if="error" class="error" data-testid="login-error" role="alert">{{ error }}</p>
  </form>
</template>

<style scoped>
form { display: grid; gap: 0.75rem; max-width: 20rem; }
label { display: grid; gap: 0.25rem; }
</style>
