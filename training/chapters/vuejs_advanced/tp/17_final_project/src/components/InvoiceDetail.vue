<script setup lang="ts">
import { ref } from 'vue';
import { fetchInvoice, type InvoiceStatus } from '@/api/fakeApi';
import { useInvoicesStore } from '@/stores/invoices';

const props = defineProps<{ id: number }>();

const store = useInvoicesStore();

// Top-level `await` in `<script setup>`: this component has an ASYNC setup, so
// it can only be mounted inside a `<Suspense>`. That is deliberate — it is what
// step 4 is about. `fetchInvoice` rejects on an unknown id, and that rejection
// travels up to whatever boundary you put around it.
const invoice = ref(await fetchInvoice(props.id));

const pending = ref(false);
const error = ref<string | null>(null);

async function setStatus(status: InvoiceStatus): Promise<void> {
  pending.value = true;
  error.value = null;
  try {
    await store.setStatus(props.id, status);
    invoice.value = { ...invoice.value, status };
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <article data-testid="invoice-detail">
    <h2>{{ invoice.number }} — {{ invoice.customer }}</h2>
    <dl>
      <dt>Amount</dt>
      <dd>{{ invoice.amount.toFixed(2) }} €</dd>
      <dt>Due date</dt>
      <dd>{{ invoice.dueDate }}</dd>
      <dt>Status</dt>
      <dd data-testid="detail-status">{{ invoice.status }}</dd>
    </dl>

    <div class="row">
      <button type="button" :disabled="pending" @click="setStatus('sent')">Mark as sent</button>
      <button type="button" :disabled="pending" @click="setStatus('paid')">Mark as paid</button>
    </div>

    <p v-if="error" class="error" role="alert" data-testid="detail-error">{{ error }}</p>
  </article>
</template>

<style scoped>
dl {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.2rem 1rem;
}
dt {
  color: var(--muted);
  font-size: 0.9em;
}
dd {
  margin: 0;
}
</style>
