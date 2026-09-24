import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { failureSwitch } from '@/api/fakeApi';
import type { Column } from '@/components/table';
import ChartPanel from '@/components/ChartPanel.vue';
import ProfilePanel from '@/components/ProfilePanel.vue';
import ModalPanel from '@/components/ModalPanel.vue';
import InvoiceTablePanel from '@/components/InvoiceTablePanel.vue';
import DataTable from '@/components/DataTable.vue';

/**
 * The executable half of steps 2, 3 and 4, plus the error path of step 1.
 *
 * These specs are given and they are red on the skeleton:
 *
 *   npm run test:watch
 *
 * The rest of step 1 (async components) is NOT here, and that is the honest
 * answer rather than a gap. "The chart is not in the entry chunk" is a claim
 * about the BUNDLE: jsdom inlines every module, so a passing test would prove
 * nothing about what a user downloads — you check that one in the Network tab.
 */

/**
 * `DataTable` constrains its rows to `{ id: number }` and infers the rest. The
 * two empty-state specs below care about neither invoices nor columns, so they
 * use that minimal shape — passing `Column<Invoice>[]` with an empty `rows`
 * array would leave `T` inferred as `{ id: number }` and fail to compile.
 */
const columns: Column<{ id: number }>[] = [{ key: 'id', label: '#' }];

beforeEach(() => {
  failureSwitch.chart = false;
  failureSwitch.profile = false;

  // `App.vue` renders this container after the panels. The specs below mount a
  // single panel, so the teleport target has to exist on its own.
  const root = document.createElement('div');
  root.id = 'modal-root';
  document.body.appendChild(root);
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('the async chart', () => {
  it('renders ChartError when the chart chunk fails to load', async () => {
    const wrapper = mount(ChartPanel);

    // Flipped AFTER the panel is mounted: the switch only bites when the chart's
    // module is evaluated — on "Show", once it is really loaded on demand.
    failureSwitch.chart = true;
    await wrapper.get('[data-testid="toggle-chart"]').trigger('click');

    // `errorComponent` covers the LOADER failing — a chunk that does not arrive.
    // An error thrown later, inside the loaded component, is not its business.
    await vi.waitFor(() => expect(wrapper.find('[data-testid="chart-error"]').exists()).toBe(true), {
      timeout: 2000,
    });
    expect(wrapper.find('[data-testid="sales-chart"]').exists()).toBe(false);
  });
});

describe('Suspense', () => {
  it('shows one fallback for the whole subtree while the profile loads', async () => {
    const wrapper = mount(ProfilePanel);

    expect(wrapper.find('[data-testid="profile-skeleton"]').exists()).toBe(true);

    await vi.waitFor(() => expect(wrapper.find('[data-testid="user-profile"]').exists()).toBe(true), {
      timeout: 4000,
    });
    expect(wrapper.find('[data-testid="profile-skeleton"]').exists()).toBe(false);
  });

  it('reloads the profile when the user changes', async () => {
    const wrapper = mount(ProfilePanel);
    await vi.waitFor(() => expect(wrapper.find('[data-testid="user-profile"]').exists()).toBe(true), {
      timeout: 4000,
    });

    await wrapper.get('[data-testid="next-user"]').trigger('click');

    // `:key="userId"` is what re-creates the component. Without it, changing the
    // prop changes nothing at all: the `await` lives in `setup()`, and `setup()`
    // runs once. The boundary going back to pending is the proof it re-ran.
    //
    // Note what does NOT happen: the fallback does not come back. On an UPDATE,
    // `<Suspense>` keeps the resolved content on screen and only emits `pending`
    // — bringing the fallback back would take `timeout="0"`. So the previous
    // profile stays visible while the next one loads, and `@pending` is the only
    // way the button knows to disable itself.
    await vi.waitFor(
      () => expect(wrapper.get('[data-testid="next-user"]').attributes('disabled')).toBeDefined(),
      { timeout: 2000 },
    );

    await vi.waitFor(
      () => expect(wrapper.get('[data-testid="next-user"]').attributes('disabled')).toBeUndefined(),
      { timeout: 4000 },
    );
  });

  it('renders an error for a rejected async setup, instead of staying blank', async () => {
    failureSwitch.profile = true;
    const wrapper = mount(ProfilePanel);

    await vi.waitFor(() => expect(wrapper.find('[data-testid="profile-error"]').exists()).toBe(true), {
      timeout: 4000,
    });

    // A rejected async `setup()` is not "not yet", it is "never": `#fallback`
    // covers the first, `onErrorCaptured` is the only thing that covers the
    // second. Without it the panel just stays blank for ever.
    //
    // The message itself is not asserted: once the setup has rejected, Vue still
    // attempts a render, and the TypeError from that second failure is what ends
    // up in the boundary. What matters is that SOMETHING is shown.
    expect(wrapper.find('[data-testid="profile-skeleton"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="user-profile"]').exists()).toBe(false);
  });
});

describe('the headless DataTable', () => {
  it('renders the parent-provided empty slot when there is no row', () => {
    const wrapper = mount(DataTable, {
      props: { rows: [] as { id: number }[], columns },
      slots: { cell: '<span />', empty: 'No invoice matches this filter.' },
    });

    expect(wrapper.get('[data-testid="empty-row"]').text()).toContain(
      'No invoice matches this filter.',
    );
  });

  it('falls back to its own message when the parent gives no empty slot', () => {
    const wrapper = mount(DataTable, {
      props: { rows: [] as { id: number }[], columns },
      slots: { cell: '<span />' },
    });

    // The `empty` slot is optional in `defineSlots`, so `$slots.empty` has to
    // guard the row — otherwise a parent that does not provide it gets an empty
    // <tr> with a stray colspan.
    expect(wrapper.get('[data-testid="empty-row"]').text()).toContain('No data');
  });

  it('lets the parent render the cells, and keeps the raw value as fallback', async () => {
    const wrapper = mount(InvoiceTablePanel);

    // The empty row lives in `<tbody>` too, so waiting for "a row" would pass
    // instantly, before the invoices have loaded. Wait for it to go away.
    await vi.waitFor(
      () => expect(wrapper.find('[data-testid="empty-row"]').exists()).toBe(false),
      { timeout: 4000 },
    );

    // Both decisions are made in the PANEL, through the `cell` slot. `DataTable`
    // itself knows nothing about invoices, currencies or statuses.
    expect(wrapper.text()).toMatch(/€/);
    expect(wrapper.find('.badge').exists()).toBe(true);
  });
});

describe('Teleport', () => {
  it('moves the dialog out of the clipping panel, and back without losing input', async () => {
    const wrapper = mount(ModalPanel, { attachTo: document.body });

    await wrapper.get('[data-testid="open-modal"]').trigger('click');
    // `defer` postpones the target lookup past the current render, so the nodes
    // land in `#modal-root` one tick later.
    await vi.waitFor(
      () =>
        expect(document.querySelector('#modal-root [data-testid="modal-backdrop"]')).not.toBeNull(),
      { timeout: 2000 },
    );

    // The component tree is unchanged; only the DOM nodes moved — so the panel's
    // own subtree no longer contains them.
    expect(wrapper.find('[data-testid="modal-backdrop"]').exists()).toBe(false);

    document.querySelector<HTMLInputElement>('[data-testid="modal-reason"]')!.value = 'because';
    document.querySelector<HTMLInputElement>('[data-testid="modal-inline"]')!.click();

    // `:disabled` puts the nodes back WITHOUT unmounting anything: a teleport
    // relocates nodes, it never re-creates them, so the typed value survives.
    await vi.waitFor(
      () => expect(wrapper.find('[data-testid="modal-backdrop"]').exists()).toBe(true),
      { timeout: 2000 },
    );
    expect(document.querySelector<HTMLInputElement>('[data-testid="modal-reason"]')!.value).toBe(
      'because',
    );
  });
});
