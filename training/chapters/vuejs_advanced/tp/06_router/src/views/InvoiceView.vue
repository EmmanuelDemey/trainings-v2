<script setup lang="ts">
import { ref, watch } from 'vue';
import { NavigationFailureType, isNavigationFailure, useRouter } from 'vue-router';
import { fetchInvoice, type Invoice } from '@/api/fakeApi';

// `props: true` on the route record: the id arrives as a prop, so this view can
// be mounted in a test without a router at all.
const props = defineProps<{ id: string }>();

const router = useRouter();
const invoice = ref<Invoice | null>(null);
const error = ref<string | null>(null);
const navNotice = ref<string | null>(null);

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

/**
 * `router.push` RESOLVES with a `NavigationFailure` — it does not throw. That is
 * the trap: `await router.push(...)` inside a try/catch catches nothing, and a
 * navigation that silently did not happen looks exactly like one that did.
 *
 * Two failures are worth distinguishing:
 *  - `duplicated`: you are already there (click "Next invoice" on the last id,
 *    where the guard-less push resolves to the same route). Harmless, but the
 *    UI should not pretend something happened.
 *  - `aborted`: a guard returned `false` — e.g. the dirty-form guard in
 *    `InvoiceFormView`. The user chose to stay; say so rather than doing nothing.
 */
async function next(): Promise<void> {
  navNotice.value = null;

  const failure = await router.push({
    name: 'invoice',
    params: { id: String(Number(props.id) + 1) },
  });

  if (isNavigationFailure(failure, NavigationFailureType.duplicated)) {
    navNotice.value = 'You are already on this invoice.';
  } else if (isNavigationFailure(failure, NavigationFailureType.aborted)) {
    navNotice.value = 'Navigation was cancelled by a guard.';
  } else if (isNavigationFailure(failure)) {
    navNotice.value = 'Navigation did not complete.';
  }
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

    <p v-if="navNotice" class="muted" data-testid="nav-notice" role="status">{{ navNotice }}</p>

    <div class="row">
      <button type="button" data-testid="next-invoice" @click="next">Next invoice</button>
      <button type="button" @click="router.back()">Back</button>
    </div>
  </section>
</template>
