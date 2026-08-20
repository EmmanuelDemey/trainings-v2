<script setup lang="ts">
/**
 * Stands in for a real charting component: it is deliberately "heavy" (it pulls
 * a large static dataset and does some work on mount) and it fetches its own
 * data. This is exactly the kind of component you do NOT want in the entry chunk.
 */
import { ref, onMounted } from 'vue';
import { fetchSales, type SalesPoint } from '@/api/fakeApi';

// A chunk of static payload, standing in for a charting library.
const PALETTE: string[] = Array.from({ length: 512 }, (_, i) => `hsl(${i % 360} 70% 55%)`);

const points = ref<SalesPoint[]>([]);
const max = ref(1);

onMounted(async () => {
  points.value = await fetchSales();
  max.value = Math.max(...points.value.map((p) => p.amount), 1);
});
</script>

<template>
  <div class="chart" data-testid="sales-chart">
    <div
      v-for="(point, index) in points"
      :key="point.month"
      class="bar"
      :style="{
        height: `${(point.amount / max) * 100}%`,
        background: PALETTE[index * 17 % PALETTE.length],
      }"
      :title="`${point.month}: ${point.amount.toLocaleString('en')} €`"
    >
      <span>{{ point.month }}</span>
    </div>
  </div>
</template>

<style scoped>
.chart {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 180px;
}
.bar {
  flex: 1;
  border-radius: 4px 4px 0 0;
  position: relative;
  min-height: 4px;
}
.bar span {
  position: absolute;
  bottom: -1.4rem;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 0.7rem;
  color: var(--muted);
}
</style>
