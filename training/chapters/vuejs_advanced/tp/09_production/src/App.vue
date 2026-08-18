<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { config } from './config';

// TODO 2.3: import the `prefetch` helper from the router and call it on
//   `@mouseenter` / `@focus` of each link below. Watch the Network tab: the
//   chunk must arrive BEFORE the click.
</script>

<template>
  <h1>TP 8 — Production &amp; deployment</h1>

  <nav class="row">
    <RouterLink :to="{ name: 'home' }">Home</RouterLink>
    <RouterLink :to="{ name: 'invoices' }">Invoices</RouterLink>
    <RouterLink :to="{ name: 'reports' }">Reports</RouterLink>
    <RouterLink :to="{ name: 'settings' }">Settings</RouterLink>
    <RouterLink :to="{ name: 'about' }">About</RouterLink>

    <span style="flex: 1" />
    <span class="muted">mode: {{ config.mode }}</span>
  </nav>

  <RouterView />
</template>

<style>
nav { border-bottom: 1px solid var(--border); padding-bottom: 0.75rem; margin-bottom: 1.5rem; }
nav a { color: inherit; text-decoration: none; }
nav a.router-link-active { color: var(--accent); font-weight: 600; }
</style>
