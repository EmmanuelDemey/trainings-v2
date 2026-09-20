<script setup lang="ts">
/** Purely presentational. Nothing to change here. */
import type { Release } from '../api/fakeApi';

defineProps<{ release: Release }>();
defineEmits<{ close: [] }>();
</script>

<template>
  <aside class="drawer" data-testid="detail">
    <h2 data-testid="detail-title">{{ release.title }}</h2>
    <p class="muted">{{ release.status }} — {{ release.votes }} votes</p>
    <button type="button" data-testid="close" @click="$emit('close')">Close</button>
  </aside>
</template>
