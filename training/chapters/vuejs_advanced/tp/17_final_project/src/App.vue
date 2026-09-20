<script setup lang="ts">
import { ref, watch } from 'vue';
import { RouterLink, RouterView, useRouter } from 'vue-router';
import { getFailWrites, setFailWrites } from '@/api/fakeApi';
import { useAuthStore } from '@/stores/auth';
import ErrorBoundary from '@/components/ErrorBoundary.vue';

const auth = useAuthStore();
const router = useRouter();

/** The switch that makes every write fail — your rollback needs it. */
const failWrites = ref(getFailWrites());
watch(failWrites, (value) => setFailWrites(value));

async function logout(): Promise<void> {
  auth.logout();
  await router.push({ name: 'home' });
}
</script>

<template>
  <header>
    <nav class="row">
      <RouterLink :to="{ name: 'home' }">Home</RouterLink>
      <RouterLink :to="{ name: 'invoices' }">Invoices</RouterLink>
      <RouterLink :to="{ name: 'invoice-new' }">New invoice</RouterLink>

      <span style="flex: 1" />

      <label class="muted row" style="gap: 0.35rem">
        <input v-model="failWrites" type="checkbox" data-testid="fail-writes" />
        Simulate a server error
      </label>

      <template v-if="auth.isAuthenticated">
        <span class="muted">{{ auth.user?.name }} ({{ auth.roles.join(', ') }})</span>
        <button type="button" data-testid="logout" @click="logout">Sign out</button>
      </template>
      <RouterLink v-else :to="{ name: 'login' }">Sign in</RouterLink>
    </nav>
  </header>

  <main>
    <ErrorBoundary>
      <RouterView />
    </ErrorBoundary>
  </main>
</template>

<style>
header nav {
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.75rem;
  margin-bottom: 1.5rem;
}
header a {
  color: inherit;
  text-decoration: none;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}
header a.router-link-active {
  color: var(--accent);
  font-weight: 600;
}
</style>
