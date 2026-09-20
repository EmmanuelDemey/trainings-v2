<script setup lang="ts">
/**
 * This component only cares about the theme. Yet it re-renders whenever the
 * catalog is reloaded, because it reads a store that owns everything.
 *
 * TODO 1.3: once `useUiStore` exists, point this component at it and watch its
 *   render counter stop moving when you reload the catalog.
 */
import { onUpdated } from 'vue';
import { storeToRefs } from 'pinia';
import { useShopStore } from '@/stores/shop';
import { renderStats, countRender } from './renderStats';

const shop = useShopStore();
const { theme } = storeToRefs(shop);

onUpdated(() => countRender('ThemePanel'));
</script>

<template>
  <section :data-theme="theme">
    <h2>1 — Store splitting</h2>

    <div class="row">
      <button type="button" data-testid="toggle-theme" @click="shop.toggleTheme()">
        Theme: {{ theme }}
      </button>
      <span class="muted">
        This panel re-rendered <strong data-testid="theme-renders">{{ renderStats.ThemePanel }}</strong>
        time(s)
      </span>
    </div>

    <p class="muted">
      Reload the catalog below and watch this counter. It should not move: this
      component does not care about products.
    </p>
  </section>
</template>
