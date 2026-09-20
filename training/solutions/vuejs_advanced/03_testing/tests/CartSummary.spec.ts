import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import CartSummary from '@/components/CartSummary.vue';
import { useCartStore, type CartLine } from '@/stores/cart';

const lines: CartLine[] = [
  { id: 1, label: 'Espresso machine', price: 249, qty: 2 },
  { id: 2, label: 'Chef knife', price: 89, qty: 1 },
];

/**
 * STEP 4 — Testing a Pinia-connected component.
 *
 * `createTestingPinia` seeds the state and turns every ACTION into a spy. The
 * getters keep running for real — which is what makes the first test worth
 * writing: it asserts on `total`, the actual `price * qty` reduction, not on a
 * number we hard-coded into a mock.
 */
describe('CartSummary', () => {
  it('renders the seeded cart', () => {
    const wrapper = mount(CartSummary, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, initialState: { cart: { lines } } })],
      },
    });

    // 2 + 1 items, 249 * 2 + 89 * 1.
    expect(wrapper.get('[data-testid="count"]').text()).toBe('3 item(s)');
    expect(wrapper.get('[data-testid="total"]').text()).toBe('587.00 €');
  });

  it('calls the `remove` action with the right id', async () => {
    const wrapper = mount(CartSummary, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, initialState: { cart: { lines } } })],
      },
    });

    const cart = useCartStore();

    await wrapper.get('[data-testid="remove-2"]').trigger('click');

    expect(cart.remove).toHaveBeenCalledOnce();
    expect(cart.remove).toHaveBeenCalledWith(2);

    // The line is STILL there: with `stubActions: true` (the default) the real
    // `remove` never ran, so the state never changed. That is the whole point —
    // this test asserts the component's side of the contract ("clicking calls
    // remove(2)") and nothing about the store's implementation of it.
    expect(wrapper.find('[data-testid="line-2"]').exists()).toBe(true);
  });

  it('actually empties the cart when actions are not stubbed', async () => {
    const wrapper = mount(CartSummary, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: { cart: { lines } },
            stubActions: false,
          }),
        ],
      },
    });

    await wrapper.get('[data-testid="clear"]').trigger('click');

    // `stubActions: false` still spies, but lets the real action through: this
    // is the integration-flavoured variant, and it is the one that would catch
    // a `clear()` that forgot to empty `lines`.
    expect(wrapper.get('[data-testid="count"]').text()).toBe('0 item(s)');
    expect(wrapper.findAll('[data-testid^="line-"]')).toHaveLength(0);
  });
});
