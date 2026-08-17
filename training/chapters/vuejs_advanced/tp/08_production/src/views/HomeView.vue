<script setup lang="ts">
import { config } from '@/config';
</script>

<template>
  <section>
    <h2>TP 8 — Production &amp; deployment</h2>

    <p>
      This app is deliberately built the default way: every view is imported
      statically and a 120 kB "library" ships in the entry chunk for a feature
      almost nobody uses.
    </p>

    <dl>
      <dt>Mode</dt><dd data-testid="mode">{{ config.mode }}</dd>
      <dt>API URL</dt><dd data-testid="api-url">{{ config.apiUrl }}</dd>
      <dt>Reports feature</dt><dd data-testid="feature-reports">{{ config.features.reports }}</dd>
    </dl>

    <p class="muted">
      Start with <code>npm run build</code> and write the numbers down. Every step
      of this workshop is measured against that first build.
    </p>
  </section>
</template>

<style scoped>
dl { display: grid; grid-template-columns: 10rem 1fr; gap: 0.25rem 1rem; }
dt { color: var(--muted); }
dd { margin: 0; }
</style>
