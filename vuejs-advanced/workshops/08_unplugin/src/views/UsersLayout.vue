<script setup lang="ts">
/**
 * The users layout. In `src/pages/` this is the file **beside** the folder:
 * `users.vue` next to `users/`. Nothing routes through it today — the
 * hand-written array below forgot it.
 */
import { RouterView } from 'vue-router';
</script>

<template>
  <section>
    <h2 data-testid="users-layout">Users</h2>
    <RouterView />
  </section>
</template>
