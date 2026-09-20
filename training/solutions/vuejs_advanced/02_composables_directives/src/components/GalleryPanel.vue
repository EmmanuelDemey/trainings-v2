<script setup lang="ts">
/**
 * 60 images in a scrollable container. Without the directive, all 60 are
 * downloaded on load. With it, only the visible ones are.
 */
import { ref } from 'vue';
import { products, type Product } from '@/api/fakeApi';
import { lazyStats } from '@/directives/lazyImg';

const gallery = ref<Product[]>([...products]);

/** Rotates the photos so the `updated` hook of the directive is exercised. */
function shuffle(): void {
  const photos = gallery.value.map((p) => p.photo);
  gallery.value = gallery.value.map((p, i) => ({
    ...p,
    photo: photos[(i + 7) % photos.length]!,
  }));
}
</script>

<template>
  <section>
    <h2>4 &amp; 5 — v-lazy-img</h2>

    <div class="row" style="margin-bottom: 0.75rem">
      <button type="button" data-testid="shuffle" @click="shuffle">Shuffle photos</button>
      <strong data-testid="loaded-count">{{ lazyStats.loaded }} image(s) actually loaded</strong>
    </div>

    <p class="muted">
      Scroll the strip below. Before you implement the directive, the counter
      stays at 0 and every image is fetched on load; after, the counter should
      grow as you scroll.
    </p>

    <div class="gallery">
      <figure v-for="product in gallery" :key="product.id">
        <!--
          Registered globally by `directivesPlugin`, so no import here.

          Try `v-lazy-img.eager` and compare when the downloads start: the eager
          modifier uses a 400px root margin, so images load one screen ahead.

          And the honest comparison: `<img :src="…" loading="lazy">` is native,
          free, and needs no directive at all. Write the directive to understand
          `IntersectionObserver` — then ask yourself, on a real project, what it
          gives you that the attribute does not (a placeholder, an error
          fallback, a load counter, a custom margin). If the answer is "nothing",
          use the attribute.
        -->
        <img v-lazy-img="product.photo" :alt="product.name" width="200" height="150" />
        <figcaption class="muted">{{ product.name }}</figcaption>
      </figure>
    </div>
  </section>
</template>

<style scoped>
.gallery {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}
figure { margin: 0; flex: 0 0 auto; }
img { display: block; border-radius: 8px; background: var(--border); }
figcaption { font-size: 0.75rem; max-width: 200px; }
</style>
