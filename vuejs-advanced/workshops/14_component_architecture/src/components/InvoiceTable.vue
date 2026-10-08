<script setup lang="ts">
/**
 * Copy #1 of the table. Iteration, sorting, empty state — and the invoice row,
 * all in one file.
 *
 * TODO 4: the sorting and the empty state are **true** duplication with
 *   `PaymentTable.vue`: same markup, same reason to change. They move to
 *   `ui/DataTable.vue`.
 *
 *   What is left — how an invoice row looks — is **shape-only** duplication with
 *   the payment row. Different teams, different roadmaps. Keep both, as
 *   `features/invoicing/components/InvoiceRow.vue` and
 *   `features/payments/components/PaymentRow.vue`.
 */
import { computed, ref } from 'vue';
import Badge from '../ui/Badge.vue';
import type { Invoice } from '../types';

const props = defineProps<{ invoices: Invoice[] }>();

const sortKey = ref<'reference' | 'amountCents' | null>(null);
const descending = ref(false);

const sorted = computed(() => {
  if (sortKey.value === null) return props.invoices;
  const key = sortKey.value;
  const rows = [...props.invoices].sort((a, b) =>
    key === 'amountCents' ? a.amountCents - b.amountCents : a.reference.localeCompare(b.reference),
  );
  return descending.value ? rows.reverse() : rows;
});

function sortBy(key: 'reference' | 'amountCents'): void {
  if (sortKey.value === key) descending.value = !descending.value;
  else {
    sortKey.value = key;
    descending.value = false;
  }
}

function euros(cents: number): string {
  return `${(cents / 100).toFixed(2)} €`;
}
</script>

<template>
  <p v-if="sorted.length === 0" class="muted" data-testid="empty">No invoice for this period</p>

  <table v-else data-testid="invoice-table">
    <thead>
      <tr>
        <th data-testid="sort-reference" @click="sortBy('reference')">Reference</th>
        <th>Client</th>
        <th data-testid="sort-amountCents" @click="sortBy('amountCents')">Amount</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="invoice in sorted" :key="invoice.id" data-testid="row">
        <td data-testid="cell-reference">{{ invoice.reference }}</td>
        <td class="muted">{{ invoice.client }}</td>
        <td data-testid="cell-amount">{{ euros(invoice.amountCents) }}</td>
        <td><Badge :invoice-status="invoice.status" :late="invoice.status === 'late'" small /></td>
      </tr>
    </tbody>
  </table>
</template>
