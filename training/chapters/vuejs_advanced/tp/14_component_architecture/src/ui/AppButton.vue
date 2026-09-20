<script setup lang="ts">
/**
 * A button — in `ui/`, and importing a **store**. Ask the question out loud:
 * *could I copy this file into a different product?* No. Something in `ui/` that
 * answers no is not a `ui/` component.
 *
 * TODO 3: cut the store out. The count belongs to the caller: take it as a prop,
 *   or better, let the caller put it in the default slot. `ui/` never imports a
 *   store, a route, an API client or a domain type.
 */
import { computed } from 'vue';
import { useInvoicesStore } from '../stores/invoices';

const props = defineProps<{ variant?: 'primary' | 'ghost'; showInvoiceCount?: boolean }>();

const invoices = useInvoicesStore();
const suffix = computed(() => (props.showInvoiceCount ? ` (${invoices.visible.length})` : ''));
</script>

<template>
  <button type="button" data-testid="app-button" :data-variant="variant ?? 'primary'">
    <slot />{{ suffix }}
  </button>
</template>
