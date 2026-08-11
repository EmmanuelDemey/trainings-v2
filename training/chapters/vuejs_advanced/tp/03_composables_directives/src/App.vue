<script setup lang="ts">
import CatalogPanel from './components/CatalogPanel.vue';
import FavoritesPanel from './components/FavoritesPanel.vue';
import GalleryPanel from './components/GalleryPanel.vue';
</script>

<template>
  <h1>TP 3 — Composables &amp; directives</h1>
  <p class="muted">
    Keep the Network tab open (filter on Img and Fetch): both halves of this
    workshop are about what does <em>not</em> get requested.
  </p>

  <CatalogPanel />
  <FavoritesPanel />
  <GalleryPanel />
</template>
