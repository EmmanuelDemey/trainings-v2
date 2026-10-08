<script setup lang="ts">
/**
 * The payments half of the shape-only duplication. It maps a payment to a tone
 * its own way — and the day payments need a fourth state, invoicing does not
 * have to care.
 */
import Badge from '@/ui/Badge.vue';
import { euros } from '@/utils/money';
import type { Payment } from '../types';

defineProps<{ payment: Payment }>();
</script>

<template>
  <td data-testid="cell-reference">{{ payment.reference }}</td>
  <td class="muted">{{ payment.method }}</td>
  <td data-testid="cell-amount">{{ euros(payment.amountCents) }}</td>
  <td>
    <Badge :tone="payment.settled ? 'success' : 'info'">{{ payment.method }}</Badge>
  </td>
</template>
