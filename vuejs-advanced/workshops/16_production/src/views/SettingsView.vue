<script setup lang="ts">
import { config } from '@/config';
</script>

<template>
  <section>
    <h2>Settings</h2>
    <p class="muted">
      Everything here comes from the build-time environment. Run
      <code>npm run build:staging</code> and check what changed in
      <code>dist/</code>.
    </p>
    <p>Current API: <code>{{ config.apiUrl }}</code></p>
  </section>
</template>
