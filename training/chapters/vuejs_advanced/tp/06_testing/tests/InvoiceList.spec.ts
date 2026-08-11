import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { http, HttpResponse } from 'msw';
import InvoiceList from '@/components/InvoiceList.vue';
import { server, invoices } from './msw';

/**
 * STEP 1 — Four states, four tests, one component.
 *
 * The default MSW handlers return the happy path. Override them per test with
 * `server.use(...)` — `resetHandlers()` in `tests/setup.ts` undoes it afterwards.
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
    //   Hint: `wrapper.findAll('[data-testid^="invoice-"]')`.
    expect(invoices).toHaveLength(3);
    void wrapper;
  });

  it('shows an empty state when the API returns no invoice', async () => {
    server.use(http.get('/api/invoices', () => HttpResponse.json([])));

    const wrapper = mount(InvoiceList);
    await flushPromises();

    // TODO 1.3: assert `[data-testid="empty"]` is rendered.
    void wrapper;
  });

  it('shows an error and recovers when the retry succeeds', async () => {
    server.use(http.get('/api/invoices', () => new HttpResponse(null, { status: 500 })));

    const wrapper = mount(InvoiceList);
    await flushPromises();

    // TODO 1.4: assert the error alert is displayed and mentions the status.

    // TODO 1.5: restore the happy-path handler with `server.use(...)`, click
    //   `[data-testid="retry"]`, `await flushPromises()` and assert the list is
    //   now rendered. This is the test that proves `retry` actually re-fetches.
    void wrapper;
  });
});
