<script setup lang="ts">
/**
 * The wrong abstraction, caught at prop number eight.
 *
 * It started as "a coloured label". Then invoicing needed a status, then
 * payments needed a method, then someone needed both at once — and every new
 * caller added a prop and a `v-if` on the previous one.
 *
 * TODO 4: bring it back to what it actually is: a coloured label. One `tone`
 *   prop (`neutral | info | success | danger`) and a slot. The **caller** maps
 *   its own domain value to a tone — a new variant then becomes a new caller
 *   rather than a new prop. And `ui/` stops importing `Invoice`.
 */
import { computed } from 'vue';
import type { Invoice, Payment } from '../types';

const props = defineProps<{
  invoiceStatus?: Invoice['status'];
  paymentMethod?: Payment['method'];
  settled?: boolean;
  late?: boolean;
  uppercase?: boolean;
  small?: boolean;
  outlined?: boolean;
  withDot?: boolean;
}>();

const label = computed(() => {
  if (props.invoiceStatus) return props.invoiceStatus;
  if (props.paymentMethod) return props.paymentMethod;
  return props.settled ? 'settled' : 'pending';
});

const tone = computed(() => {
  if (props.late || props.invoiceStatus === 'late') return 'danger';
  if (props.invoiceStatus === 'paid' || props.settled) return 'success';
  if (props.paymentMethod) return 'info';
  return 'neutral';
});
</script>

<template>
  <span
    class="badge"
    data-testid="badge"
    :data-tone="tone"
    :data-small="small || undefined"
    :data-outlined="outlined || undefined"
  >
    <i v-if="withDot" class="dot" />
    {{ uppercase ? label.toUpperCase() : label }}
  </span>
</template>
