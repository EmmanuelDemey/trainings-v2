<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
  <h1>TP 6 — Advanced testing</h1>

  <nav class="row">
    <RouterLink to="/" data-testid="nav-home">Catalog</RouterLink>
    <RouterLink to="/invoices" data-testid="nav-invoices">Invoices</RouterLink>
    <RouterLink to="/cart" data-testid="nav-cart">Cart</RouterLink>
    <RouterLink to="/login" data-testid="nav-login">Sign in</RouterLink>
  </nav>

  <RouterView />
</template>

<style>
nav { border-bottom: 1px solid var(--border); padding-bottom: 0.75rem; margin-bottom: 1.5rem; }
nav a { color: inherit; text-decoration: none; }
nav a.router-link-active { color: var(--accent); font-weight: 600; }
</style>
