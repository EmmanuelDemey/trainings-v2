<script setup lang="ts">
/**
 * Domain through and through — it knows what "late" means. It belongs to
 * `features/invoicing/components/`, never to `ui/`.
 */
import { useInvoicesStore } from '../stores/invoices';

const invoices = useInvoicesStore();
</script>

<template>
  <label class="row">
    <input v-model="invoices.onlyLate" type="checkbox" data-testid="only-late" />
    Late invoices only
  </label>
</template>
