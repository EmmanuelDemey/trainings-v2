<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Invoice, InvoiceStatus } from '@/api/fakeApi';
import InvoiceTable from '@/components/InvoiceTable.vue';
import { useAsyncData } from '@/composables/useAsyncData';
import { useInvoicesStore } from '@/stores/invoices';

const store = useInvoicesStore();

// The store owns the invoices; the request state stays here, where the request
// is made. `refresh` is wired to the button below — click it twice quickly once
// step 1 is done, and watch the first request get cancelled.
const { loading, error, refresh } = useAsyncData((signal) => store.load(signal));

const statusFilter = ref<InvoiceStatus | 'all'>('all');
const visible = ref<Invoice[]>([]);

watch([statusFilter, loading], () => {
  visible.value =
    statusFilter.value === 'all'
      ? store.all
      : store.all.filter((invoice) => invoice.status === statusFilter.value);
});

const writeError = ref<string | null>(null);

async function onUpdateStatus(id: number, status: InvoiceStatus): Promise<void> {
  writeError.value = null;
  try {
    await store.setStatus(id, status);
  } catch (e) {
    writeError.value = (e as Error).message;
  }
}
</script>

<template>
  <section>
    <div class="row" style="justify-content: space-between">
      <h2>Invoices</h2>
      <button type="button" data-testid="refresh" @click="refresh">Refresh</button>
    </div>

    <dl class="summary" data-testid="summary">
      <div><dt>Outstanding</dt><dd>{{ store.outstandingTotal.toFixed(2) }} €</dd></div>
      <div><dt>Draft</dt><dd>{{ store.countByStatus.draft }}</dd></div>
      <div><dt>Sent</dt><dd>{{ store.countByStatus.sent }}</dd></div>
      <div><dt>Paid</dt><dd>{{ store.countByStatus.paid }}</dd></div>
      <div><dt>Late</dt><dd>{{ store.countByStatus.late }}</dd></div>
    </dl>

    <div class="row" style="margin: 0.75rem 0">
      <label>
        Status
        <select v-model="statusFilter" data-testid="status-filter">
          <option value="all">All</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="late">Late</option>
        </select>
      </label>
    </div>

    <p v-if="loading" class="muted" data-testid="loading">Loading invoices…</p>
    <p v-else-if="error" class="error" role="alert" data-testid="load-error">{{ error.message }}</p>
    <InvoiceTable v-else :invoices="visible" @update-status="onUpdateStatus" />

    <p v-if="writeError" class="error" role="alert" data-testid="write-error">{{ writeError }}</p>
  </section>
</template>

<style scoped>
.summary {
  display: flex;
  gap: 1.5rem;
  margin: 0;
  flex-wrap: wrap;
}
.summary dt {
  font-size: 0.8em;
  color: var(--muted);
  text-transform: uppercase;
}
.summary dd {
  margin: 0;
  font-size: 1.2em;
  font-weight: 600;
}
</style>
