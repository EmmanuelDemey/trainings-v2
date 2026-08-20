import { defineStore, acceptHMRUpdate } from 'pinia';
import { computed, ref } from 'vue';
import {
  createInvoice as apiCreate,
  fetchInvoices as apiFetchAll,
  updateInvoiceStatus as apiUpdateStatus,
  type Invoice,
  type InvoiceStatus,
  type NewInvoice,
} from '@/api/fakeApi';

/**
 * STEP 2 — the invoices store.
 *
 * Two decisions, both from chapter 6:
 *
 *  - the collection is an INDEX plus an ORDER, not an array you scan. `find(id)`
 *    is called once per row on every render of the detail view and once per
 *    status change; an array turns that into O(n) each time. Splitting identity
 *    (`byId`) from presentation order (`ids`) also means sorting the table never
 *    touches the entities.
 *
 *  - `setStatus` is OPTIMISTIC: the UI moves first and rolls back if the server
 *    refuses. Flip "Simulate a server error" in the header to see it.
 */
export const useInvoicesStore = defineStore('invoices', () => {
  const byId = ref<Record<number, Invoice>>({});
  const ids = ref<number[]>([]);

  /** The list, in server order. */
  const all = computed<Invoice[]>(() => ids.value.map((id) => byId.value[id]!).filter(Boolean));

  /** One lookup, not a scan. */
  function find(id: number): Invoice | undefined {
    return byId.value[id];
  }

  /**
   * `computed`, not a function called from the template. A method re-runs on
   * every render of every component that calls it; a computed runs once per
   * change of `byId` and is shared by all of them.
   */
  const countByStatus = computed<Record<InvoiceStatus, number>>(() => {
    const counts: Record<InvoiceStatus, number> = { draft: 0, sent: 0, paid: 0, late: 0 };
    for (const invoice of all.value) counts[invoice.status] += 1;
    return counts;
  });

  const outstandingTotal = computed<number>(() =>
    all.value.reduce((sum, invoice) => (invoice.status === 'paid' ? sum : sum + invoice.amount), 0),
  );

  function upsert(invoice: Invoice): void {
    if (!(invoice.id in byId.value)) ids.value.push(invoice.id);
    byId.value[invoice.id] = invoice;
  }

  /**
   * Loads the collection. Note what is NOT here: `loading` and `error`. Request
   * state belongs to the caller that made the request — `useAsyncData` in the
   * view owns it, the store owns the entities. Chapter 6, state placement.
   */
  async function load(signal?: AbortSignal): Promise<void> {
    const invoices = await apiFetchAll(signal);

    byId.value = Object.fromEntries(invoices.map((invoice) => [invoice.id, invoice]));
    ids.value = invoices.map((invoice) => invoice.id);
  }

  /**
   * Optimistic update.
   *
   * The user clicks, the row changes NOW — no spinner for a change they already
   * decided on. If the server refuses, the previous value comes back AND the
   * error is rethrown, because a rollback nobody is told about is
   * indistinguishable from a bug: the user sees their change silently undo
   * itself and concludes the app is broken.
   *
   * On success the SERVER's version wins, not the guess: it may have set an
   * `updatedAt`, recomputed a total, or normalised the status.
   */
  async function setStatus(id: number, status: InvoiceStatus): Promise<void> {
    const invoice = find(id);
    if (!invoice) throw new Error(`Invoice ${id} is not loaded`);

    const previousStatus = invoice.status;

    // 1. Optimistic write.
    byId.value[id] = { ...invoice, status };

    try {
      // 2. Confirm with the server, and keep what it returns.
      const updated = await apiUpdateStatus(id, status);
      upsert(updated);
    } catch (error) {
      // 3. Roll back…
      const current = byId.value[id];
      if (current) byId.value[id] = { ...current, status: previousStatus };

      // 4. …and rethrow, so the view can tell the user.
      throw error;
    }
  }

  async function create(input: NewInvoice): Promise<Invoice> {
    const created = await apiCreate(input);
    upsert(created);
    return created;
  }

  return {
    byId,
    ids,
    all,
    countByStatus,
    outstandingTotal,
    find,
    upsert,
    load,
    setStatus,
    create,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useInvoicesStore, import.meta.hot));
}
