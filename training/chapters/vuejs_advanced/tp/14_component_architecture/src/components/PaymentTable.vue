<script setup lang="ts">
/**
 * Copy #2. The sorting block below is character-for-character the one in
 * `InvoiceTable.vue` — the day someone fixes the three-state sort, they will fix
 * it in one of the two.
 */
import { computed, ref } from 'vue';
import Badge from '../ui/Badge.vue';
import type { Payment } from '../types';

const props = defineProps<{ payments: Payment[] }>();

const sortKey = ref<'reference' | 'amountCents' | null>(null);
const descending = ref(false);

const sorted = computed(() => {
  if (sortKey.value === null) return props.payments;
  const key = sortKey.value;
  const rows = [...props.payments].sort((a, b) =>
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
  <p v-if="sorted.length === 0" class="muted" data-testid="empty">No payment for this period</p>

  <table v-else data-testid="payment-table">
    <thead>
      <tr>
        <th data-testid="sort-reference" @click="sortBy('reference')">Reference</th>
        <th>Method</th>
        <th data-testid="sort-amountCents" @click="sortBy('amountCents')">Amount</th>
        <th>State</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="payment in sorted" :key="payment.id" data-testid="row">
        <td data-testid="cell-reference">{{ payment.reference }}</td>
        <td class="muted">{{ payment.method }}</td>
        <td data-testid="cell-amount">{{ euros(payment.amountCents) }}</td>
        <td><Badge :payment-method="payment.method" :settled="payment.settled" small /></td>
      </tr>
    </tbody>
  </table>
</template>
