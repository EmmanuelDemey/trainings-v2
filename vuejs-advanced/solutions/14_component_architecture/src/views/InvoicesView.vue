<script setup lang="ts">
/**
 * A view is the only layer allowed to know several layers at once: it composes a
 * `ui/` table with an `invoicing/` row and an `invoicing/` toolbar, and it is
 * where the two meet.
 *
 * Note what the slots did to the table: no `invoice` prop, no `variant`, no
 * `v-if`. The table iterates; the caller decides what a row is.
 */
import { computed } from 'vue';
import DataTable from '@/ui/DataTable.vue';
import AppButton from '@/ui/AppButton.vue';
import type { Column } from '@/ui/dataTable';
import { euros } from '@/utils/money';
import { InvoiceFilters, InvoiceRow, useInvoicesStore } from '@/features/invoicing';

const invoices = useInvoicesStore();

const columns: Column[] = [
  { key: 'reference', label: 'Reference', sortable: true },
  { key: 'client', label: 'Client' },
  { key: 'amountCents', label: 'Amount', sortable: true },
  { key: 'status', label: 'Status' },
];

const count = computed(() => invoices.visible.length);
</script>

<template>
  <section>
    <h2>Invoices</h2>

    <DataTable :rows="invoices.visible" :columns="columns">
      <template #toolbar>
        <InvoiceFilters />
        <AppButton>Invoices ({{ count }})</AppButton>
        <span class="muted">
          Total: <strong data-testid="invoices-total">{{ euros(invoices.total) }}</strong>
        </span>
      </template>

      <template #row="{ row }">
        <InvoiceRow :invoice="row" />
      </template>

      <template #empty>
        <p class="muted" data-testid="empty">No invoice for this period</p>
      </template>
    </DataTable>
  </section>
</template>
