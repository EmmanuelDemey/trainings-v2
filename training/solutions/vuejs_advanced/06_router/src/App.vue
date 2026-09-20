<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';

const auth = useAuthStore();
const router = useRouter();

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
      <RouterLink :to="{ name: 'admin' }">Admin</RouterLink>

      <span style="flex: 1" />

      <template v-if="auth.isAuthenticated">
        <span class="muted">{{ auth.user?.name }} ({{ auth.roles.join(', ') }})</span>
        <button type="button" data-testid="logout" @click="logout">Sign out</button>
      </template>
      <RouterLink v-else :to="{ name: 'login' }">Sign in</RouterLink>
    </nav>
  </header>

  <main>
    <!--
      `mode="out-in"` matters: without it the leaving and entering views are in
      the DOM at the same time and the page jumps. With it, the old one finishes
      leaving before the new one starts.

      `:key="route.path"` is what makes /invoices/1 -> /invoices/2 animate at
      all: same route record, same component, so Vue would otherwise patch the
      existing instance and no transition would ever trigger.

      `<KeepAlive :include="['InvoicesView']">` caches that one view by its
      `name` (set with `defineOptions`), so its filter and scroll position
      survive a round trip. Deliberately a whitelist: caching everything means
      caching every stale fetch and every leaked timer along with it.
    -->
    <RouterView v-slot="{ Component, route }">
      <Transition :name="(route.meta.transition as string) ?? 'fade'" mode="out-in">
        <KeepAlive :include="['InvoicesView']">
          <component :is="Component" :key="route.path" />
        </KeepAlive>
      </Transition>
    </RouterView>
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

.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active { transition: transform 0.25s ease, opacity 0.25s ease; }

.slide-left-enter-from { transform: translateX(24px); opacity: 0; }
.slide-left-leave-to { transform: translateX(-24px); opacity: 0; }
.slide-right-enter-from { transform: translateX(-24px); opacity: 0; }
.slide-right-leave-to { transform: translateX(24px); opacity: 0; }
</style>
