<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { fetchInvoice, type Invoice } from '@/api/fakeApi';

// `props: true` on the route record: the id arrives as a prop, so this view can
// be mounted in a test without a router at all.
const props = defineProps<{ id: string }>();

const router = useRouter();
const invoice = ref<Invoice | null>(null);
const error = ref<string | null>(null);

// The SAME component instance is reused between /invoices/1 and /invoices/2:
// `onMounted` would not run again. Watching the prop is the fix.
watch(
  () => props.id,
  async (id) => {
    invoice.value = null;
    error.value = null;
    try {
      invoice.value = await fetchInvoice(Number(id));
    } catch (e) {
      error.value = (e as Error).message;
    }
  },
  { immediate: true },
);

// TODO 5.2: `router.push` resolves to a NavigationFailure instead of throwing.
//   Log it here and show a message when the navigation is aborted or duplicated.
//   Try clicking "Next invoice" twice in a row on the same id.
async function next(): Promise<void> {
  const failure = await router.push({
    name: 'invoice',
    params: { id: String(Number(props.id) + 1) },
  });
  void failure;
}
</script>

<template>
  <section>
    <h2>Invoice #{{ id }}</h2>

    <p v-if="error" class="error" data-testid="invoice-error">{{ error }}</p>
    <p v-else-if="!invoice" class="muted">Loading…</p>

    <template v-else>
      <p data-testid="invoice-customer"><strong>{{ invoice.customer }}</strong></p>
      <p>{{ invoice.total.toFixed(2) }} € — {{ invoice.status }}</p>
    </template>

    <div class="row">
      <button type="button" data-testid="next-invoice" @click="next">Next invoice</button>
      <button type="button" @click="router.back()">Back</button>
    </div>
  </section>
</template>
