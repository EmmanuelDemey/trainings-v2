<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter, type RouteLocationRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const email = ref('ada@example.com');
const password = ref('admin');
const error = ref<string | null>(null);
const pending = ref(false);

/**
 * `redirect` comes from the URL, so it is user input — and it is about to be
 * handed to the router.
 *
 * The regex accepts a path starting with EXACTLY ONE slash. `(?!\/)` is the
 * whole point: `//evil.example.com` starts with a slash and is read by the
 * browser as `https://evil.example.com`. Without that negative lookahead you
 * have shipped an open redirect that passes every "does it start with /"
 * review — and open redirects are how phishing links borrow your domain's
 * reputation.
 *
 * Try it: sign out, open `/login?redirect=https://example.com`, and drop the
 * check.
 */
function safeRedirect(): RouteLocationRaw {
  const target = route.query.redirect;
  if (typeof target === 'string' && /^\/(?!\/)/.test(target)) return target;
  return { name: 'home' };
}

async function onSubmit(): Promise<void> {
  error.value = null;
  pending.value = true;
  try {
    await auth.login(email.value, password.value);

    // `replace`, not `push`: the login page must not stay in the history, or
    // the first Back after signing in sends the user straight back to it — and
    // the guard bounces them home. A loop the user cannot escape with Back.
    await router.replace(safeRedirect());
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
