<script setup lang="ts">
/**
 * Consumer of `DataTable`. Every cell rendering decision is made HERE, while the
 * table keeps the sorting and iteration logic. Nothing below reaches into
 * `DataTable` — that is the whole point of the scoped slot.
 */
import { computed, ref, onMounted } from 'vue';
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

// Built once, not per cell: `Intl.NumberFormat` is expensive to construct and
// this table renders it 12 times per pass.
const currency = new Intl.NumberFormat('en', { style: 'currency', currency: 'EUR' });

const filtered = computed(() =>
  invoices.value.filter((invoice) =>
    invoice.customer.toLowerCase().includes(filter.value.toLowerCase()),
  ),
);

onMounted(async () => {
  invoices.value = await fetchInvoices(12);
});
</script>

<template>
  <section>
    <h2>3 — Scoped slots</h2>
    <p class="muted">
      Type a customer name that does not exist to see the empty state.
    </p>

    <div class="row" style="margin-bottom: 1rem">
      <input v-model="filter" data-testid="filter" placeholder="Filter by customer" />
    </div>

    <DataTable :rows="filtered" :columns="columns">
      <!--
        `row` is typed `Invoice` here, not `any` — that is `defineSlots` plus the
        `generic="T"` attribute on DataTable doing their job. Write `row.nope`
        and `npm run typecheck` fails.
      -->
      <template #cell="{ row, column, value }">
        <template v-if="column.key === 'total'">
          {{ currency.format(row.total) }}
        </template>

        <span v-else-if="column.key === 'status'" class="badge" :class="`badge--${row.status}`">
          {{ row.status }}
        </span>

        <template v-else>{{ value }}</template>
      </template>

      <template #empty>No invoice matches this filter.</template>
    </DataTable>
  </section>
</template>

<style scoped>
.badge {
  display: inline-block;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}
.badge--paid { background: #d8f5dd; color: #17632a; }
.badge--pending { background: #fdefd2; color: #8a5a00; }
.badge--late { background: #fbdcdc; color: #8e1b1b; }
</style>
