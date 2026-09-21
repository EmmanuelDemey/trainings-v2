<script setup lang="ts">
import { computed } from 'vue';
import InvoiceTable from '../components/InvoiceTable.vue';
import InvoiceFilters from '../components/InvoiceFilters.vue';
import AppButton from '../ui/AppButton.vue';
import { useInvoicesStore } from '../stores/invoices';

const invoices = useInvoicesStore();

const count = computed(() => invoices.visible.length);

function euros(cents: number): string {
  return `${(cents / 100).toFixed(2)} €`;
}
</script>

<template>
  <section>
    <h2>Invoices</h2>
    <div class="row">
      <InvoiceFilters />
      <AppButton>Invoices ({{ count }})</AppButton>
      <span class="muted">Total: <strong data-testid="invoices-total">{{ euros(invoices.total) }}</strong></span>
    </div>
    <InvoiceTable :invoices="invoices.visible" />
  </section>
</template>
