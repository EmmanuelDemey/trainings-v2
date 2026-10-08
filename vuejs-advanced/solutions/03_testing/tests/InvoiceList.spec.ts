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

    // No `await` here on purpose: we assert on the FIRST render. Add one and
    // this test goes green whatever `loading` starts at — it would be asserting
    // on the resolved state and telling you nothing about the loading one.
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="invoice-list"]').exists()).toBe(false);
  });

  it('renders every invoice returned by the API', async () => {
    const wrapper = mount(InvoiceList);
    await flushPromises();

    // NOT `[data-testid^="invoice-"]`: that prefix also matches the `<ul>`
    // (`invoice-list`) and the chart (`invoice-chart`), so it reports 5 rows for
    // 3 invoices. A selector that is too loose is a test that cannot fail for
    // the right reason.
    const rows = wrapper.findAll('[data-testid="invoice-list"] li');
    expect(rows).toHaveLength(invoices.length);
    expect(wrapper.text()).toContain('Acme');
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(false);
  });
});
