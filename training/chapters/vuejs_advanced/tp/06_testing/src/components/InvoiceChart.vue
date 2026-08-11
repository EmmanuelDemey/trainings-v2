<script setup lang="ts">
/**
 * Stands in for a real charting component: it touches layout APIs jsdom does not
 * implement well, so tests stub it. Step 3 asserts on the PROPS it receives
 * rather than on what it renders.
 */
import { computed, onMounted, ref } from 'vue';
import type { Invoice } from '@/api/client';

const props = defineProps<{ invoices: Invoice[]; currency: string }>();

const width = ref(0);
const total = computed(() => props.invoices.reduce((n, i) => n + i.total, 0));

onMounted(() => {
  // getBoundingClientRect() always returns zeros in jsdom — a good reason to stub.
  width.value = document.body.getBoundingClientRect().width;
});
</script>

<template>
  <div class="chart" data-testid="invoice-chart" :style="{ width: `${width}px` }">
    <div
      v-for="invoice in invoices"
      :key="invoice.id"
      class="bar"
      :style="{ height: `${(invoice.total / Math.max(total, 1)) * 100}%` }"
    />
    <span class="muted">{{ total.toFixed(2) }} {{ currency }}</span>
  </div>
</template>

<style scoped>
.chart { display: flex; align-items: flex-end; gap: 4px; height: 80px; }
.bar { flex: 1; background: var(--accent); border-radius: 3px 3px 0 0; min-height: 3px; }
</style>
