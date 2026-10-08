import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { enableAutoUnmount, flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { apiLog, apiSettings, failureSwitch, resetApi } from '@/api/fakeApi';
import { createQueryClient } from '@/queryClient';
import App from '@/App.vue';

/**
 * The executable half of the workshop — steps 1 to 4, through the whole app.
 *
 * These specs are given, and they are red on the skeleton. Keep them running
 * while you work:
 *
 *   npm run test:watch
 *
 * They mount `App` and read two things only: what the page shows, and
 * `apiLog`, the list of requests the fake server received. Nothing here imports
 * `src/queries/issues.ts` — its functions do not exist yet, and a spec that
 * cannot LOAD is a broken exercise, not a red test.
 *
 * Each test gets a fresh QueryClient built by YOUR `createQueryClient()`: a
 * cache shared between tests would make every one of them depend on the order
 * they run in.
 */

enableAutoUnmount(afterEach);

beforeEach(() => {
  resetApi();
  // Slow enough to catch the page BEFORE the server answers, fast enough to
  // keep the run short.
  apiSettings.latencyMs = 50;
});

function mountApp(): VueWrapper {
  return mount(App, {
    global: { plugins: [[VueQueryPlugin, { queryClient: createQueryClient() }]] },
  });
}

function sent(request: string): number {
  return apiLog.filter((entry) => entry === request).length;
}

async function mountAndWaitForTheList(): Promise<VueWrapper> {
  const wrapper = mountApp();
  await vi.waitFor(() => expect(wrapper.find('[data-testid="issue-1"]').exists()).toBe(true));
  return wrapper;
}

describe('steps 1 and 2 — one cache for the whole app', () => {
  it('asks for the open issues once, however many components need them', async () => {
    const wrapper = await mountAndWaitForTheList();

    expect(wrapper.get('[data-testid="open-count"]').text()).toContain('3 open');
    // The list and the header counter both need the open issues. Two components,
    // same key: one request.
    expect(sent('GET /issues?status=open')).toBe(1);
  });
});

describe('step 2 — a key that follows the filter', () => {
  it('shows each filter, and serves one it already loaded from the cache', async () => {
    const wrapper = await mountAndWaitForTheList();

    await wrapper.get('[data-testid="filter-closed"]').trigger('click');
    await vi.waitFor(() => expect(wrapper.find('[data-testid="issue-4"]').exists()).toBe(true));
    expect(wrapper.find('[data-testid="issue-1"]').exists()).toBe(false);

    await wrapper.get('[data-testid="filter-open"]').trigger('click');
    await flushPromises();

    // Back on a filter loaded a second ago: it is still fresh (`staleTime`), so
    // it shows at once and the server never hears about it.
    expect(wrapper.find('[data-testid="issue-1"]').exists()).toBe(true);
    expect(sent('GET /issues?status=open')).toBe(1);
  });
});

describe('step 3 — a mutation that invalidates', () => {
  it('refreshes the list AND the header counter after creating an issue', async () => {
    const wrapper = await mountAndWaitForTheList();

    await wrapper.get('[data-testid="new-title"]').setValue('Totals are rounded twice');
    await wrapper.get('form').trigger('submit');

    await vi.waitFor(() => expect(wrapper.find('[data-testid="issue-6"]').exists()).toBe(true));
    // The counter lives in another component, and nobody told it anything: only
    // an invalidation of the shared key keeps it honest.
    await vi.waitFor(() =>
      expect(wrapper.get('[data-testid="open-count"]').text()).toContain('4 open'),
    );
  });
});

describe('step 4 — an optimistic update', () => {
  it('moves the issue the moment you click, before the server answers', async () => {
    const wrapper = await mountAndWaitForTheList();
    const before = apiLog.length;

    await wrapper.get('[data-testid="toggle-1"]').trigger('click');
    await flushPromises();

    // The PATCH is on its way, and nothing came back yet.
    expect(apiLog.slice(before)).toEqual(['PATCH /issues/1']);
    expect(wrapper.find('[data-testid="issue-1"]').exists()).toBe(false);
    expect(wrapper.get('[data-testid="open-count"]').text()).toContain('2 open');
  });

  it('puts the issue back, and says so, when the server refuses', async () => {
    // Green on the skeleton too — which never moved the issue in the first
    // place. It is the guard rail of step 4: an optimistic update without its
    // rollback turns it red.
    const wrapper = await mountAndWaitForTheList();
    failureSwitch.status = true;

    await wrapper.get('[data-testid="toggle-1"]').trigger('click');
    await vi.waitFor(() => expect(apiLog).toContain('PATCH /issues/1'));
    // The PATCH left with the short latency. Whatever the app sends next — the
    // refetch of `onSettled` — will not be back before the assertions: only the
    // rollback of `onError` can put the issue back in time.
    apiSettings.latencyMs = 5_000;

    await vi.waitFor(() => expect(wrapper.find('[data-testid="toggle-error"]').exists()).toBe(true));
    expect(wrapper.find('[data-testid="issue-1"]').exists()).toBe(true);
    expect(wrapper.get('[data-testid="open-count"]').text()).toContain('3 open');
  });
});
