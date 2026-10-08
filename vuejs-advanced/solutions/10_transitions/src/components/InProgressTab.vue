<script setup lang="ts">
import type { Release } from '../api/fakeApi';

defineProps<{ releases: Release[] }>();
</script>

<template>
  <div data-testid="tab-panel" data-tab="in-progress">
    <p class="muted">On a branch, behind a flag.</p>
    <p><strong>{{ releases.length }}</strong> in-progress</p>
  </div>
</template>
