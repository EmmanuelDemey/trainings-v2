import { describe, expect, it } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ADMIN_TOKEN, freshRouter } from './helpers';

/**
 * `InvoiceView` is given, and so is this spec: it pins down the
 * programmatic-navigation trap the README points you to. Green from the start.
 */
describe('"Next invoice"', () => {
  it('reports a duplicated navigation on the last invoice instead of pretending to move', async () => {
    const { router, pinia } = await freshRouter(ADMIN_TOKEN);
    await router.push('/invoices/5');

    const InvoiceView = (await import('@/views/InvoiceView.vue')).default;
    const wrapper = mount(InvoiceView, {
      props: { id: '5' },
      global: { plugins: [router, pinia] },
    });

    await wrapper.get('[data-testid="next-invoice"]').trigger('click');
    await flushPromises();

    expect(router.currentRoute.value.fullPath).toBe('/invoices/5');
    expect(wrapper.get('[data-testid="nav-notice"]').text()).toBe(
      'You are already on this invoice.',
    );

    wrapper.unmount();
  });
});
