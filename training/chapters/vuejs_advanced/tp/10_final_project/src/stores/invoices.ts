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
 * The list view, the detail view and the form all read from here. Two things
 * chapter 6 insisted on and this skeleton does not do yet:
 *  - the collection is stored as an INDEX plus an order, not as an array you
 *    scan with `.find()` on every render
 *  - the status change is OPTIMISTIC: the UI moves first, and rolls back if the
 *    server refuses. Flip "Simulate a server error" in the header to see it.
 */
export const useInvoicesStore = defineStore('invoices', () => {
  // TODO 2.1: replace the array with an index + an order.
  //   `byId: Record<number, Invoice>` (or a `Map`) and `ids: number[]`.
  //   Every getter and every action below changes with it — that is the point:
  //   the shape of the state is a decision, not an accident.
  const items = ref<Invoice[]>([]);

  /** The list, in server order. */
  const all = computed<Invoice[]>(() => items.value);

  /** One lookup, not a scan. Used by the detail view and by `setStatus`. */
  function find(id: number): Invoice | undefined {
    // TODO 2.1: O(1) once the state is an index.
    return items.value.find((invoice) => invoice.id === id);
  }

  // TODO 2.2: two getters the header displays:
  //   - `countByStatus`: `Record<InvoiceStatus, number>`
  //   - `outstandingTotal`: the sum of the amounts that are NOT paid
  //   Write them as `computed`, not as functions called from the template.
  const countByStatus = computed<Record<InvoiceStatus, number>>(() => ({
    draft: 0,
    sent: 0,
    paid: 0,
    late: 0,
  }));
  const outstandingTotal = computed<number>(() => 0);

  function upsert(invoice: Invoice): void {
    const index = items.value.findIndex((i) => i.id === invoice.id);
    if (index === -1) items.value.push(invoice);
    else items.value[index] = invoice;
  }

  /**
   * Loads the collection. Note what is NOT here: `loading` and `error`. Request
   * state belongs to the caller that made the request — `useAsyncData` in the
   * view owns it, the store owns the entities. Chapter 6, state placement.
   */
  async function load(signal?: AbortSignal): Promise<void> {
    const invoices = await apiFetchAll(signal);
    // TODO 2.1: fill the index and the order here.
    items.value = invoices;
  }

  /**
   * TODO 2.3: make this optimistic.
   *   1. remember the previous status
   *   2. apply the new one immediately, so the table updates without waiting
   *   3. call the API
   *   4. on failure: restore the previous status AND rethrow, so the caller can
   *      show the message — a rollback nobody is told about looks like a bug
   *   5. on success: keep what the server returned (it is the source of truth)
   *
   * This is the behaviour you will write a test for in step 6.
   */
  async function setStatus(id: number, status: InvoiceStatus): Promise<void> {
    const updated = await apiUpdateStatus(id, status);
    upsert(updated);
  }

  async function create(input: NewInvoice): Promise<Invoice> {
    const created = await apiCreate(input);
    upsert(created);
    return created;
  }

  return {
    items,
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
