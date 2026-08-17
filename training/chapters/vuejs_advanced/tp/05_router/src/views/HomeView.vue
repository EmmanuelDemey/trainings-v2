<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
</script>

<template>
  <section>
    <h2>TP 5 — Advanced routing</h2>
    <p>
      Two accounts are available:
      <code>ada@example.com</code> / <code>admin</code> (admin + user) and
      <code>alan@example.com</code> / <code>user</code> (user only).
    </p>
    <p class="muted" data-testid="auth-state">
      Current state: {{ auth.isAuthenticated ? `signed in as ${auth.user?.name}` : 'anonymous' }}
    </p>
    <p class="muted">
      Start by opening <code>/invoices</code> directly in the address bar while
      signed out. Then sign in and hard-refresh the page. Both journeys must work
      by the end of this workshop.
    </p>
  </section>
</template>
