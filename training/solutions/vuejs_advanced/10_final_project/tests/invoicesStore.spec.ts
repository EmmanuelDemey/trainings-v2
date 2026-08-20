import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { setFailWrites } from '@/api/fakeApi';
import { useInvoicesStore } from '@/stores/invoices';

/**
 * STEP 6 — the first of the two tests we chose to write.
 *
 * Named after the BEHAVIOUR, not the function: a reviewer reads
 * "rolls the status back and rethrows when the server refuses" and knows what
 * breaks if it goes red. `describe('setStatus')` would have told them nothing.
 *
 * Why this behaviour: an optimistic update whose rollback is broken corrupts
 * what the user sees, silently, and only when the server is already having a bad
 * day. It is the single most expensive thing in this app to get wrong, and the
 * hardest to notice by clicking around.
 *
 * A real `createPinia()`, not `createTestingPinia`: the point here IS the
 * store's own logic. Stubbing the actions would test nothing.
 */
describe('invoices store', () => {
  beforeEach(async () => {
    setActivePinia(createPinia());
    setFailWrites(false);
    await useInvoicesStore().load();
  });

  afterEach(() => {
    setFailWrites(false);
  });

  it('applies a status change immediately, before the server answers', async () => {
    const store = useInvoicesStore();
    const before = store.find(2)!.status;

    const pending = store.setStatus(2, 'paid');

    // Not awaited yet: this is the whole promise of an optimistic update — the
    // table has already moved while the request is still in flight.
    expect(store.find(2)!.status).toBe('paid');
    expect(before).not.toBe('paid');

    await pending;
    expect(store.find(2)!.status).toBe('paid');
  });

  it('rolls the status back and rethrows when the server refuses', async () => {
    const store = useInvoicesStore();
    const before = store.find(2)!.status;

    setFailWrites(true);

    // The rethrow is half the behaviour under test. A rollback nobody is told
    // about looks exactly like a bug: the user watches their change undo itself
    // and concludes the app is broken.
    await expect(store.setStatus(2, 'paid')).rejects.toThrow(/unavailable/i);

    expect(store.find(2)!.status).toBe(before);
  });

  it('keeps the derived totals in step with the rollback', async () => {
    const store = useInvoicesStore();
    const outstandingBefore = store.outstandingTotal;
    const countsBefore = { ...store.countByStatus };

    setFailWrites(true);
    await expect(store.setStatus(2, 'paid')).rejects.toThrow();

    // The getters are computed from the same state, so a rollback that missed
    // one of them would show up here — a header that disagrees with the table
    // is the symptom users actually report.
    expect(store.outstandingTotal).toBe(outstandingBefore);
    expect(store.countByStatus).toEqual(countsBefore);
  });
});
