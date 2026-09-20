import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { createMemoryHistory, createRouter } from 'vue-router';
import InvoiceFormView from '@/views/InvoiceFormView.vue';
import { useInvoicesStore } from '@/stores/invoices';

/**
 * STEP 6 — the second test we chose.
 *
 * Why this behaviour: "the form calls the API with data it already knows is
 * invalid" is the failure that reaches production most often, because clicking
 * through the happy path never exposes it. And the assertion that matters is the
 * NEGATIVE one — `create` was not called. A test that only checks the messages
 * appear would stay green on a form that shows them and submits anyway.
 */
const routes = [
  { path: '/', component: { template: '<div />' } },
  { path: '/invoices/new', component: InvoiceFormView },
  { path: '/invoices/:id', name: 'invoice', component: { template: '<div />' } },
];

function mountForm() {
  const router = createRouter({ history: createMemoryHistory(), routes });
  return mount(InvoiceFormView, {
    global: {
      plugins: [createTestingPinia({ createSpy: vi.fn }), router],
    },
  });
}

describe('the new-invoice form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the messages and calls no API when the submit is invalid', async () => {
    const wrapper = mountForm();
    const store = useInvoicesStore();

    // Everything empty: four rules broken at once.
    await wrapper.get('form').trigger('submit');
    await flushPromises();

    expect(store.create).not.toHaveBeenCalled();

    const text = wrapper.text();
    expect(text).toContain('Expected the format INV-1234');
    expect(text).toContain('At least 2 characters');
  });

  it('rejects a reference that does not match INV-0000', async () => {
    const wrapper = mountForm();
    const store = useInvoicesStore();

    await wrapper.get('#field-number').setValue('1001');
    await wrapper.get('#field-customer').setValue('Acme');
    await wrapper.get('#field-amount').setValue('120.50');
    await wrapper.get('#field-dueDate').setValue('2030-01-31');

    await wrapper.get('form').trigger('submit');
    await flushPromises();

    expect(store.create).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain('Expected the format INV-1234');
  });

  it('submits the PARSED payload, with a numeric amount', async () => {
    const wrapper = mountForm();
    const store = useInvoicesStore();
    vi.mocked(store.create).mockResolvedValue({
      id: 42,
      number: 'INV-9001',
      customer: 'Acme',
      amount: 120.5,
      status: 'draft',
      dueDate: '2030-01-31',
    });

    await wrapper.get('#field-number').setValue('INV-9001');
    await wrapper.get('#field-customer').setValue('Acme');
    await wrapper.get('#field-amount').setValue('120.50');
    await wrapper.get('#field-dueDate').setValue('2030-01-31');

    await wrapper.get('form').trigger('submit');
    await flushPromises();

    // A NUMBER, not the string the input held. This is the assertion that
    // catches a submit sending `form` instead of `result.data`.
    expect(store.create).toHaveBeenCalledWith({
      number: 'INV-9001',
      customer: 'Acme',
      amount: 120.5,
      dueDate: '2030-01-31',
    });
  });
});
