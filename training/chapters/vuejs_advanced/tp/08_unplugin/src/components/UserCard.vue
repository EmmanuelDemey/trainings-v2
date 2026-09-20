<script setup lang="ts">
import type { User } from '../api/fakeApi';

defineProps<{ user: User }>();
</script>

<template>
  <article data-testid="user-card">
    <strong>{{ user.name }}</strong>
    <span class="muted"> — {{ user.email }} ({{ user.team }})</span>
  </article>
</template>
