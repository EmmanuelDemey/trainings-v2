<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
</script>

<template>
  <section>
    <h2>Administration</h2>
    <p data-testid="admin-content">
      Reserved for the <code>admin</code> role. Signed in as
      <strong>{{ auth.user?.name ?? 'nobody' }}</strong>.
    </p>
    <p class="muted">
      Sign in as <code>alan@example.com</code> / <code>user</code> and try to reach
      this page: you should land on <code>/forbidden</code>, not here.
    </p>
  </section>
</template>
