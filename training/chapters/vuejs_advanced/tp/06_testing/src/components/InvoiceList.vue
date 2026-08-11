<script setup lang="ts">
/**
 * Four states, one component: loading, error, empty, and data.
 * This is the component you will test with MSW in step 1.
 */
import { onMounted, ref } from 'vue';
import { api, type Invoice } from '@/api/client';
import InvoiceChart from './InvoiceChart.vue';

const invoices = ref<Invoice[]>([]);
const loading = ref(true);
const error = ref<Error | null>(null);

async function load(): Promise<void> {
  loading.value = true;
  error.value = null;
  try {
    invoices.value = await api.getInvoices();
  } catch (e) {
    error.value = e as Error;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <section>
    <h2>Invoices</h2>

    <p v-if="loading" data-testid="loading">Loading…</p>

    <template v-else-if="error">
      <p class="error" data-testid="error" role="alert">
        Could not load the invoices ({{ error.message }})
      </p>
      <button type="button" data-testid="retry" @click="load">Retry</button>
    </template>

    <p v-else-if="invoices.length === 0" data-testid="empty">No invoice yet.</p>

    <template v-else>
      <InvoiceChart :invoices="invoices" :currency="'EUR'" />

      <ul data-testid="invoice-list">
        <li v-for="invoice in invoices" :key="invoice.id" :data-testid="`invoice-${invoice.id}`">
          {{ invoice.customer }} — {{ invoice.total.toFixed(2) }} € ({{ invoice.status }})
        </li>
      </ul>
    </template>
  </section>
</template>
