<script setup lang="ts">
/**
 * This component only cares about the theme, and now reads the store that only
 * owns the theme. Reload a 30 000-product catalog and watch the counter below
 * stay put — before the split it moved on every load, because the component
 * was subscribed to a store that also held the products.
 */
import { onUpdated } from 'vue';
import { storeToRefs } from 'pinia';
import { useUiStore } from '@/stores/ui';
import { renderStats, countRender } from './renderStats';

const ui = useUiStore();
const { theme } = storeToRefs(ui);

onUpdated(() => countRender('ThemePanel'));
</script>

<template>
  <section :data-theme="theme">
    <h2>1 — Store splitting</h2>

    <div class="row">
      <button type="button" data-testid="toggle-theme" @click="ui.toggleTheme()">
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
