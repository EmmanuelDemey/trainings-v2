<script setup lang="ts">
/**
 * STEP 4 — Measure, then optimize
 *
 * 2 000 rows. Selecting one row changes a single prop on a single row, yet
 * every row re-renders. Fix that — but only after you have the numbers.
 */
import { ref, nextTick } from 'vue';
import InvoiceRow from './InvoiceRow.vue';
import { renderStats, reset } from './renderStats';
import { makeInvoices, type Invoice } from '@/api/fakeApi';

// TODO 4.1: measure first. Click a few rows and write down `updates` and the
//   duration. That is your baseline — you will compare every change against it.

// TODO 4.2: this list is loaded once and never mutated in place. Switch it to
//   `shallowRef` and check the numbers again.
//   import { shallowRef } from 'vue';
//   const invoices = shallowRef<Invoice[]>(makeInvoices(2000));
const invoices = ref<Invoice[]>(makeInvoices(2000));

const selectedId = ref<number | null>(null);

async function select(id: number): Promise<void> {
  reset();
  const start = performance.now();

  selectedId.value = id;

  await nextTick();
  renderStats.lastDurationMs = Math.round(performance.now() - start);
}

// TODO 4.3: the `:key` below uses the array index. Replace it with `invoice.id`
//   and explain what changes when the list is sorted or filtered.

// TODO 4.4: add `v-memo` on the `v-for` element so a row only re-renders when
//   its own selection state changes:
//     v-memo="[invoice.id === selectedId]"
//   Measure again. How many rows re-render now?
//
//   Then deliberately break it: add a `:status` binding that depends on another
//   reactive value WITHOUT listing it in the `v-memo` array, and watch the UI go
//   stale. This is the trap the slides warned about.

// TODO 4.5 (discussion): at what list size does `v-memo` stop being the right
//   answer, and what would you reach for instead?
</script>

<template>
  <section>
    <h2>4 — Rendering performance</h2>

    <div class="row" style="margin-bottom: 0.75rem">
      <span>{{ invoices.length }} rows</span>
      <strong data-testid="render-count">{{ renderStats.updates }} rows re-rendered</strong>
      <span class="muted">in {{ renderStats.lastDurationMs }} ms</span>
    </div>

    <div class="list">
      <div
        v-for="(invoice, index) in invoices"
        :key="index"
        @click="select(invoice.id)"
      >
        <InvoiceRow :invoice="invoice" :selected="invoice.id === selectedId" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.list {
  max-height: 320px;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 8px;
}
.list > div { cursor: pointer; }
</style>
