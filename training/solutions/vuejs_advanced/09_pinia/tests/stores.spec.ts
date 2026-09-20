import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { createPinia, type Pinia } from 'pinia';
import { mount } from '@vue/test-utils';
import { persistPlugin } from '@/plugins/persist';
import { actionLog, loggerPlugin } from '@/plugins/logger';
import { failureSwitch } from '@/api/fakeApi';
import CatalogPanel from '@/components/CatalogPanel.vue';
import CartPanel from '@/components/CartPanel.vue';

/**
 * The render counters are an instrument of this workshop, not a subject of these
 * specs. They are `reactive` AND read from the very templates whose `onUpdated`
 * increments them, so the first update re-renders, which increments again — Vue
 * gives up with "Maximum recursive updates exceeded". A plain, non-reactive
 * stand-in keeps the panels rendering normally here; the real counters are what
 * you read in the browser.
 */
vi.mock('@/components/renderStats', () => ({
  renderStats: { ThemePanel: 0, CatalogPanel: 0, CartPanel: 0 },
  countRender: (): void => {},
}));

/**
 * The executable half of steps 4 and 6 — the two plugins.
 *
 * These specs are given, and they are red on the skeleton. Keep them running
 * while you write `persistPlugin` and `loggerPlugin`:
 *
 *   npm run test:watch
 *
 * They deliberately go through the COMPONENTS rather than through the stores.
 * Step 1 asks you to split `stores/shop.ts` into three files that do not exist
 * yet, so a spec importing `useCatalogStore` could not even be resolved — it
 * would fail to load instead of failing an assertion. The panels, on the other
 * hand, exist before and after the split, and so do the two plugins.
 *
 * What is therefore NOT here: `shallowRef`, the `byId` index and the render
 * counters. Those are measurements you take in the browser, with the numbers
 * written down — which is what their Definition of Done boxes ask for.
 */

/**
 * `pinia.use()` only queues a plugin: it runs when the Pinia instance is
 * INSTALLED on an app. `mount(..., { global: { plugins: [pinia] } })` installs
 * it — a bare `setActivePinia(createPinia())` would not, and every assertion
 * below would fail against a perfectly correct solution.
 */
function freshPinia(): Pinia {
  const pinia = createPinia();
  pinia.use(persistPlugin);
  pinia.use(loggerPlugin);
  return pinia;
}

/** Loads a small catalog through the UI, then adds the first product. */
async function addFirstProduct(pinia: Pinia): Promise<void> {
  const catalog = mount(CatalogPanel, { global: { plugins: [pinia] } });

  await catalog.get('[data-testid="size"]').setValue(500);
  await catalog.get('[data-testid="load"]').trigger('click');
  await vi.waitFor(() => expect(catalog.find('[data-testid="add-1"]').exists()).toBe(true), {
    timeout: 4000,
  });

  await catalog.get('[data-testid="add-1"]').trigger('click');
  await nextTick();
}

beforeEach(() => {
  localStorage.clear();
  // `actionLog` is a module-level singleton shared by every Pinia instance.
  actionLog.splice(0, actionLog.length);
  failureSwitch.products = false;
});

describe('the persistence plugin', () => {
  it('persists the cart, and only the lines', async () => {
    const pinia = freshPinia();
    mount(CartPanel, { global: { plugins: [pinia] } });

    await addFirstProduct(pinia);

    const stored = localStorage.getItem('pinia:cart');
    expect(stored, 'nothing was written under `pinia:cart`').not.toBeNull();
    // `count` and `total` are derived. Persisting a getter is how you restore a
    // total that disagrees with its own cart.
    expect(Object.keys(JSON.parse(stored as string))).toEqual(['lines']);
  });

  it('leaves the catalog out of localStorage', async () => {
    const pinia = freshPinia();

    await addFirstProduct(pinia);

    // 30 000 products would blow past the 5 MB quota and throw on the first
    // write. Opting in per store is the whole point of the `persist` option.
    expect(localStorage.getItem('pinia:catalog')).toBeNull();
  });

  it('brings the cart back on a cold start', async () => {
    localStorage.setItem('pinia:cart', JSON.stringify({ lines: [{ productId: 1, qty: 2 }] }));

    const wrapper = mount(CartPanel, { global: { plugins: [freshPinia()] } });
    await nextTick();

    expect(wrapper.get('[data-testid="cart-count"]').text()).toContain('2 item');
  });

  it('drops a corrupted entry instead of breaking startup', () => {
    // localStorage is user-writable and survives deploys. A hand-edited entry,
    // or a shape from three versions ago, must not take the app down on boot.
    localStorage.setItem('pinia:cart', '{oops');

    expect(() => mount(CartPanel, { global: { plugins: [freshPinia()] } })).not.toThrow();
    expect(localStorage.getItem('pinia:cart')).toBeNull();
  });
});

describe('the logger plugin', () => {
  it('records a successful action, with a duration', async () => {
    const pinia = freshPinia();

    await addFirstProduct(pinia);

    const entry = actionLog.find((record) => record.name === 'loadProducts');
    expect(entry, '`loadProducts` was never recorded').toBeDefined();
    expect(entry?.failed).toBe(false);
    expect(typeof entry?.durationMs).toBe('number');
  });

  /**
   * The FAILED action is checked by hand, with `failureSwitch.products = true`
   * in the devtools console — it is the box in the Definition of Done.
   *
   * It is not a spec because `onError` only fires if the action rejects, and
   * nothing awaits the click handler that calls it: the rejection escapes as an
   * unhandled one, which fails the whole run even when every assertion passed.
   * A test that has to silence that is testing the harness, not the plugin.
   */

  it('reports the mutation type of `addToCart` as a patch function', async () => {
    using debug = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const pinia = freshPinia();
    mount(CartPanel, { global: { plugins: [pinia] } });

    await addFirstProduct(pinia);

    // `direct` (an assignment), `patch object`, `patch function` — the type is
    // what tells devtools whether it can group and time-travel the change.
    const logged = debug.mock.calls.flat().map(String);
    expect(logged.some((line) => line.includes('patch function'))).toBe(true);
  });
});
