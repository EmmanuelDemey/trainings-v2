<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSessionStore } from '@/stores/session';

const session = useSessionStore();
const router = useRouter();
const route = useRoute();

const email = ref('');
const password = ref('');

async function submit(): Promise<void> {
  const ok = await session.signIn(email.value, password.value);
  if (!ok) return;
  await router.push(String(route.query.redirect ?? '/tickets'));
}
</script>

<template>
  <section>
    <h2>Sign in</h2>
    <form data-testid="login-form" @submit.prevent="submit()">
      <div class="row">
        <input v-model="email" type="email" data-testid="email" aria-label="Email" placeholder="ada@acme.dev" />
        <input v-model="password" type="password" data-testid="password" aria-label="Password" placeholder="secret" />
        <button type="submit" data-testid="submit" :disabled="session.pending">
          {{ session.pending ? 'Signing in…' : 'Sign in' }}
        </button>
      </div>
    </form>
    <p v-if="session.error" class="error" data-testid="login-error">{{ session.error }}</p>
  </section>
</template>
