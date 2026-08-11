<script setup lang="ts">
/**
 * A deliberately non-trivial row: it does a bit of formatting work on every
 * render, which makes wasted re-renders measurable.
 *
 * `onUpdated` fires every time this component re-renders — that is exactly the
 * number step 4 is trying to bring down.
 */
import { computed, onUpdated } from 'vue';
import type { Invoice } from '@/api/fakeApi';
import { renderStats } from './renderStats';

const props = defineProps<{ invoice: Invoice; selected: boolean }>();

const formatter = new Intl.NumberFormat('en', { style: 'currency', currency: 'EUR' });

const label = computed(() => {
  // Stand-in for real per-row work.
  let checksum = 0;
  for (let i = 0; i < 200; i += 1) checksum += (props.invoice.id * i) % 7;
  return `${props.invoice.customer} — ${formatter.format(props.invoice.total)}`;
});

onUpdated(() => {
  renderStats.updates += 1;
});
</script>

<template>
  <div class="invoice-row" :class="{ selected }">
    <span class="id">#{{ invoice.id }}</span>
    <span>{{ label }}</span>
    <span class="muted">{{ invoice.status }}</span>
  </div>
</template>

<style scoped>
.invoice-row {
  display: grid;
  grid-template-columns: 4rem 1fr 5rem;
  gap: 0.5rem;
  padding: 0.2rem 0.4rem;
  border-bottom: 1px solid var(--border);
  font-size: 0.85rem;
}
.selected { background: color-mix(in srgb, var(--accent) 18%, transparent); }
.id { color: var(--muted); }
</style>
