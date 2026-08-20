import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { http, HttpResponse } from 'msw';
import InvoiceList from '@/components/InvoiceList.vue';
import { server, invoices } from './msw';

/**
 * STEP 1 — Four states, four tests, one component.
 *
 * The default MSW handlers return the happy path. Individual tests override
 * them with `server.use(...)` — `resetHandlers()` in `tests/setup.ts` undoes it
 * afterwards. Remove that `resetHandlers()` once and watch these four tests
 * start depending on their order: that is why it is there.
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

  it('shows an empty state when the API returns no invoice', async () => {
    server.use(http.get('/api/invoices', () => HttpResponse.json([])));

    const wrapper = mount(InvoiceList);
    await flushPromises();

    expect(wrapper.find('[data-testid="empty"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="invoice-list"]').exists()).toBe(false);
  });

  it('shows an error and recovers when the retry succeeds', async () => {
    server.use(http.get('/api/invoices', () => new HttpResponse(null, { status: 500 })));

    const wrapper = mount(InvoiceList);
    await flushPromises();

    const alert = wrapper.find('[data-testid="error"]');
    expect(alert.exists()).toBe(true);
    // Assert on the STATUS, not just "an error is shown": the message is the
    // only thing that tells a user (and you, in a bug report) what went wrong.
    expect(alert.text()).toContain('500');

    // Put the happy path back, THEN click. This is what makes the test prove the
    // button re-fetches rather than merely hides the alert.
    server.use(http.get('/api/invoices', () => HttpResponse.json(invoices)));

    await wrapper.find('[data-testid="retry"]').trigger('click');
    await flushPromises();

    expect(wrapper.find('[data-testid="error"]').exists()).toBe(false);
    expect(wrapper.findAll('[data-testid="invoice-list"] li')).toHaveLength(invoices.length);
  });
});
