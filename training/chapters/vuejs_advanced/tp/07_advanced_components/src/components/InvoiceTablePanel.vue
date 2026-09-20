<script setup lang="ts">
/**
 * Consumer of `DataTable`. Once the scoped slot exists, every cell rendering
 * decision is made HERE, while the table keeps the sorting and iteration logic.
 */
import { ref, onMounted } from 'vue';
import DataTable from './DataTable.vue';
import type { Column } from './table';
import { fetchInvoices, type Invoice } from '@/api/fakeApi';

const invoices = ref<Invoice[]>([]);
const filter = ref('');

const columns: Column<Invoice>[] = [
  { key: 'id', label: '#', sortable: true },
  { key: 'customer', label: 'Customer', sortable: true },
  { key: 'issuedAt', label: 'Issued', sortable: true },
  { key: 'total', label: 'Total', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
];

onMounted(async () => {
  invoices.value = await fetchInvoices(12);
});
</script>

<template>
  <section>
    <h2>3 — Scoped slots</h2>
    <p class="muted">
      Type a customer name that does not exist to see the empty state (once you
      have implemented it).
    </p>

    <div class="row" style="margin-bottom: 1rem">
      <input v-model="filter" data-testid="filter" placeholder="Filter by customer" />
    </div>

    <DataTable
      :rows="invoices.filter((i) => i.customer.toLowerCase().includes(filter.toLowerCase()))"
      :columns="columns"
    >
      <!--
        TODO 3.4: use the `cell` scoped slot to customise the rendering:
          - `total` ➜ formatted with `Intl.NumberFormat('en', { style: 'currency', currency: 'EUR' })`
          - `status` ➜ a coloured badge (green / orange / red)
          - every other column ➜ the raw value

        <template #cell="{ row, column, value }">
          ...
        </template>

        TODO 3.5: fill the `empty` slot with a "No invoice matches this filter"
          message.

        TODO 3.6: hover `row` in your editor inside the slot — it must be typed as
          `Invoice`, not `any`. If it is not, `defineSlots` (TODO 3.1) is missing
          or the `generic="T"` attribute was removed.
      -->
    </DataTable>
  </section>
</template>
