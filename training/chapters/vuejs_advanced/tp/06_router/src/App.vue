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
      TODO 2.1: wrap the view in a `<Transition name="fade" mode="out-in">` using
        the `v-slot` form of `<RouterView>`:

        <RouterView v-slot="{ Component, route }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" :key="route.path" />
          </Transition>
        </RouterView>

      TODO 2.2: make the transition name come from `route.meta.transition`, with
        'fade' as the default. The CSS for `fade`, `slide-left` and `slide-right`
        is already in this file.

      TODO 2.3 (bonus): add a `<KeepAlive :include="['InvoicesView']">` between
        the transition and the component, and check that the scroll position and
        the filter of the invoices list survive a round trip.
    -->
    <RouterView />
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
