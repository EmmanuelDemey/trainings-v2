<script setup lang="ts">
import { computed } from 'vue';
import { config } from '@/config';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();

/** Diagnostics footer — the key is masked, obviously. */
const maskedKey = computed(() => `••••${config.billingApiKey.slice(-4)}`);
</script>

<template>
  <section>
    <h2>Billing back-office — final project</h2>
    <p>
      Two accounts:
      <code>ada@example.com</code> / <code>admin</code> (admin + accountant) and
      <code>alan@example.com</code> / <code>user</code> (accountant only).
    </p>
    <p class="muted" data-testid="auth-state">
      Current state: {{ auth.isAuthenticated ? `signed in as ${auth.user?.name}` : 'anonymous' }}
    </p>
    <p class="muted">
      Four journeys have to work when you hand this over for review: open
      <code>/invoices</code> signed out, hard-refresh <code>/invoices</code> while
      signed in, change a status with "Simulate a server error" on, and submit the
      new-invoice form with an empty customer.
    </p>
    <p class="muted" data-testid="diagnostics">
      API: <code>{{ config.apiUrl }}</code> — billing key <code>{{ maskedKey }}</code>
    </p>
  </section>
</template>
