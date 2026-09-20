<script setup lang="ts">
import type { Release } from '../api/fakeApi';

defineProps<{ releases: Release[] }>();
</script>

<template>
  <div data-testid="tab-panel" data-tab="idea">
    <p class="muted">Nobody has said no yet.</p>
    <p><strong>{{ releases.length }}</strong> idea</p>
  </div>
</template>
