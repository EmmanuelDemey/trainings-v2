<script setup lang="ts">
import SessionBadge from './components/SessionBadge.vue';
</script>

<template>
  <header class="row">
    <h1>Support desk</h1>
    <SessionBadge />
  </header>

  <nav class="row">
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/tickets">Queue</RouterLink>
    <RouterLink to="/login">Sign in</RouterLink>
  </nav>

  <RouterView />
</template>
