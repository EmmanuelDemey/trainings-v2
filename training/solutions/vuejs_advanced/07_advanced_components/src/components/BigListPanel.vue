<script setup lang="ts">
/**
 * STEP 4 — Measure, then optimize
 *
 * 2 000 rows. Selecting one row changes a single prop on a single row, yet the
 * naive version re-renders every one of them.
 *
 * The four measurements, in order, on a mid-range laptop:
 *
 *   1. baseline (ref + index key)          ~2000 rows re-rendered   ~180 ms
 *   2. + shallowRef                        ~2000 rows re-rendered   ~150 ms
 *   3. + stable :key="invoice.id"          ~2000 rows re-rendered   ~150 ms
 *   4. + v-memo="[invoice.id === selectedId]"     2 rows            ~5 ms
 *
 * Read that table before reading the code. Only the LAST change moves the
 * number that matters, and that is the lesson:
 *
 *  - `shallowRef` removes the cost of making 2 000 objects deeply reactive at
 *    load time. It does nothing for the update, because the update was never
 *    about deep reactivity. It is still correct here — this list is replaced,
 *    never mutated in place.
 *  - a stable `:key` does not change the count either, because nothing is
 *    reordered. It matters the day you sort or filter: with an index key, Vue
 *    patches row 3 into row 7's content instead of moving the node, and any
 *    component state (an open row, a focused input) follows the WRONG row.
 *  - `v-memo` is what actually cuts the re-renders — and it is last on purpose.
 *    It is the only one of the three you can get WRONG (see below).
 */
import { ref, shallowRef, nextTick } from 'vue';
import InvoiceRow from './InvoiceRow.vue';
import { renderStats, reset } from './renderStats';
import { makeInvoices, type Invoice } from '@/api/fakeApi';

// The list is loaded once and replaced wholesale, never mutated in place:
// `shallowRef` skips making 2 000 nested objects reactive for nothing.
// Switch it back to `ref` and watch the FIRST render get slower.
const invoices = shallowRef<Invoice[]>(makeInvoices(2000));

const selectedId = ref<number | null>(null);

async function select(id: number): Promise<void> {
  reset();
  const start = performance.now();

  selectedId.value = id;

  await nextTick();
  renderStats.lastDurationMs = Math.round(performance.now() - start);
}

/**
 * Where `v-memo` stops being the answer.
 *
 * `v-memo` still creates 2 000 vnodes and walks 2 000 rows on every update —
 * it only skips the patch. Past ~10 000 rows the walk itself is the cost, and
 * the fix is to stop rendering rows nobody can see: virtual scrolling
 * (`vue-virtual-scroller`, TanStack Virtual), or server-side pagination. The
 * rule of thumb: `v-memo` makes a big list cheaper to UPDATE, virtualisation
 * makes it cheaper to EXIST.
 */
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
      <!--
        `:key="invoice.id"` — a stable identity, so Vue moves nodes instead of
        patching content into the wrong row when the list is sorted or filtered.

        `v-memo="[invoice.id === selectedId]"` — re-render this row only when its
        own selection state flips. Two rows change on a click (the one leaving
        the selection and the one entering it), so the count drops from 2 000
        to 2.

        THE TRAP: the array must list every reactive value the row's output
        depends on. Bind something else here — say `:dimmed="filterActive"` —
        without adding `filterActive` to the array, and the row keeps rendering
        the stale value with no warning, no error, nothing. That silence is why
        `v-memo` is the last optimization you reach for, not the first.
      -->
      <div
        v-for="invoice in invoices"
        :key="invoice.id"
        v-memo="[invoice.id === selectedId]"
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
