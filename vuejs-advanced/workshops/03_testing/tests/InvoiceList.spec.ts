import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import InvoiceList from '@/components/InvoiceList.vue';
import { invoices } from './msw';

/**
 * STEP 1 — The loading state, then the data state.
 *
 * The default MSW handlers (`tests/msw.ts`, wired in `tests/setup.ts`) return the
 * happy path: the three invoices, over the network, with no mock of our own code.
 */
describe('InvoiceList', () => {
  it('shows a loading state before the response arrives', () => {
    const wrapper = mount(InvoiceList);

    // No `await` here on purpose: we assert on the FIRST render.
    // TODO 1.1: assert that `[data-testid="loading"]` exists and that
    //   `[data-testid="invoice-list"]` does not.
    expect(wrapper.exists()).toBe(true);
  });

  it('renders every invoice returned by the API', async () => {
    const wrapper = mount(InvoiceList);
    await flushPromises();

    // TODO 1.2: assert there are 3 `li` elements, and that the text contains
    //   'Acme'. Then assert the loading state is gone.
    //   Hint: `wrapper.findAll('[data-testid="invoice-list"] li')`.
    expect(invoices).toHaveLength(3);
    void wrapper;
  });
});
