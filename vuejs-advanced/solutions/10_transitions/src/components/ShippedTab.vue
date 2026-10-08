<script setup lang="ts">
import type { Release } from '../api/fakeApi';

defineProps<{ releases: Release[] }>();
</script>

<template>
  <div data-testid="tab-panel" data-tab="shipped">
    <p class="muted">Out in production, and nobody has reverted it yet.</p>
    <p><strong>{{ releases.length }}</strong> shipped</p>
  </div>
</template>
