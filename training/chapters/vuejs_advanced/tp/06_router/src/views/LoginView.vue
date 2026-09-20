<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const email = ref('ada@example.com');
const password = ref('admin');
const error = ref<string | null>(null);
const pending = ref(false);

async function onSubmit(): Promise<void> {
  error.value = null;
  pending.value = true;
  try {
    await auth.login(email.value, password.value);

    // TODO 3.3: honour the `?redirect=` query set by the guard, and fall back to
    //   { name: 'home' }. Use `router.replace`, not `push` — the login page must
    //   not stay in the history.
    //
    // TODO 3.4 (security): `redirect` comes from the URL, so it is user input.
    //   Only accept a value starting with a single '/' — otherwise you have
    //   built an open redirect. Try `?redirect=https://example.com` once you
    //   have implemented 3.3 without the check, and see what happens.
    await router.replace({ name: 'home' });
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <section>
    <h2>Sign in</h2>

    <p v-if="route.query.redirect" class="muted" data-testid="redirect-notice">
      You need to sign in to reach <code>{{ route.query.redirect }}</code>.
    </p>

    <form @submit.prevent="onSubmit">
      <div class="row" style="margin-bottom: 0.75rem">
        <label>Email <input v-model="email" data-testid="email" type="email" required /></label>
      </div>
      <div class="row" style="margin-bottom: 0.75rem">
        <label>Password <input v-model="password" data-testid="password" type="password" required /></label>
      </div>

      <button type="submit" data-testid="submit" :disabled="pending">
        {{ pending ? 'Signing in…' : 'Sign in' }}
      </button>
    </form>

    <p v-if="error" class="error" data-testid="login-error" role="alert">{{ error }}</p>
  </section>
</template>
