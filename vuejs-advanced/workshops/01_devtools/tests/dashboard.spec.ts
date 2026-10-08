import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDashboardApp } from '@/createDashboardApp';
import { renderStats, resetRenderStats } from '@/components/renderStats';
import { mountDashboard } from './helpers';

/**
 * The executable half of this workshop.
 *
 * Everything here is a render COUNT or a piece of DOM — the same two things the
 * Devtools panel shows you. The specs are red on the skeleton; the Timeline is
 * how you find out why, and `npm run test:watch` is how you know you fixed it.
 *
 * What is deliberately NOT here: reading a render duration in the browser's
 * Performance panel, and driving a `ref` from the Components tab. Those are in
 * the Definition of Done, because no spec can prove you looked.
 */

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-09-20T09:41:00'));
  resetRenderStats();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('step 1 — the instrument', () => {
  it('traces component timings in development', () => {
    expect(createDashboardApp().config.performance).toBe(true);
  });
});

describe('step 2 — the clock only re-renders the clock', () => {
  it('leaves the ticket list and the stats panel alone while time passes', async () => {
    using dashboard = mountDashboard();
    const before = dashboard.wrapper.get('[data-testid="clock"]').text();

    resetRenderStats();
    await vi.advanceTimersByTimeAsync(3000);

    expect(dashboard.wrapper.get('[data-testid="clock"]').text()).not.toBe(before);
    expect(renderStats.TicketList).toBe(0);
    expect(renderStats.StatsPanel).toBe(0);
  });
});

describe('step 3 — typing only re-renders what depends on the filter', () => {
  it('re-renders the ticket list but never the stats panel', async () => {
    using dashboard = mountDashboard();
    resetRenderStats();

    await dashboard.wrapper.get('[data-testid="filter"]').setValue('billing');

    expect(renderStats.TicketList).toBeGreaterThan(0);
    expect(renderStats.StatsPanel).toBe(0);
  });

  it('keeps the desk-wide counts intact while a filter is applied', async () => {
    using dashboard = mountDashboard();

    const open = dashboard.wrapper.get('[data-testid="open-count"]').text();
    await dashboard.wrapper.get('[data-testid="filter"]').setValue('billing');

    expect(dashboard.wrapper.get('[data-testid="open-count"]').text()).toBe(open);
  });
});
