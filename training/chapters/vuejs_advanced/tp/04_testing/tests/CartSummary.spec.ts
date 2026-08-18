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
 * STEP 4 (PART 2 — chapter 8) — Testing a Pinia-connected component.
 *
 * `createTestingPinia` seeds the state and turns every action into a spy, so the
 * component is tested WITHOUT the store's real logic running.
 */
describe('CartSummary', () => {
  it('renders the seeded cart', () => {
    const wrapper = mount(CartSummary, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, initialState: { cart: { lines } } })],
      },
    });

    // TODO 4.1: assert the count is 3 and the total is 587.00 €.
    //   Note that `count` and `total` are real getters — only ACTIONS are stubbed.
    expect(wrapper.exists()).toBe(true);
  });

  it('calls the `remove` action with the right id', async () => {
    const wrapper = mount(CartSummary, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, initialState: { cart: { lines } } })],
      },
    });

    const cart = useCartStore();

    // TODO 4.2: click `[data-testid="remove-2"]` (awaited) and assert
    //   `cart.remove` was called once with `2`.
    //   Then assert the line is STILL displayed — with `stubActions: true`
    //   (the default) the real action never ran. Make sure you understand why.
    void wrapper;
    void cart;
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

    // TODO 4.3: click `[data-testid="clear"]` and assert the count drops to 0.
    //   This is the integration-flavoured variant of the test above.
    void wrapper;
  });
});
