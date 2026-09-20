<script setup lang="ts">
/**
 * What is left of `InvoiceTable.vue` once the table moved out: the cells of one
 * invoice, and the mapping from an invoice status to a `ui/` tone.
 *
 * It looks like `PaymentRow.vue`. That is **shape-only** duplication — invoicing
 * and payments are different teams with different roadmaps, and the question is
 * never "is this identical?" but "will these two change together, always?".
 * Here the answer is no, so both stay.
 */
import { computed } from 'vue';
import Badge from '@/ui/Badge.vue';
import { euros } from '@/utils/money';
import type { Invoice } from '../types';

const props = defineProps<{ invoice: Invoice }>();

const tone = computed(() => {
  if (props.invoice.status === 'late') return 'danger';
  if (props.invoice.status === 'paid') return 'success';
  return 'neutral';
});
</script>

<template>
  <td data-testid="cell-reference">{{ invoice.reference }}</td>
  <td class="muted">{{ invoice.client }}</td>
  <td data-testid="cell-amount">{{ euros(invoice.amountCents) }}</td>
  <td><Badge :tone="tone">{{ invoice.status }}</Badge></td>
</template>
