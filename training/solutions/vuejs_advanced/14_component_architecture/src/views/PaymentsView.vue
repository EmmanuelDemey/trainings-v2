<script setup lang="ts">
import DataTable from '@/ui/DataTable.vue';
import type { Column } from '@/ui/dataTable';
import { PaymentRow, usePaymentsStore } from '@/features/payments';

const payments = usePaymentsStore();

const columns: Column[] = [
  { key: 'reference', label: 'Reference', sortable: true },
  { key: 'method', label: 'Method' },
  { key: 'amountCents', label: 'Amount', sortable: true },
  { key: 'settled', label: 'State' },
];
</script>

<template>
  <section>
    <h2>Payments</h2>

    <DataTable :rows="payments.payments" :columns="columns">
      <template #row="{ row }">
        <PaymentRow :payment="row" />
      </template>

      <template #empty>
        <p class="muted" data-testid="empty">No payment for this period</p>
      </template>
    </DataTable>
  </section>
</template>
