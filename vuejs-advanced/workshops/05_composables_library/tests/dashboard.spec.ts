import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiCalls, resetApiCalls } from '@/api/fakeApi';
import { mountApp } from './helpers';

/**
 * The three consumers, driven the way a user drives them. A library is only
 * worth the migration if the app gets visibly better — these specs are what
 * "visibly better" means here.
 */

beforeEach(() => {
  vi.useFakeTimers();
  resetApiCalls();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('the search panel', () => {
  it('sends one request for a burst of keystrokes, not one per keystroke', async () => {
    using app = mountApp();
    const input = app.wrapper.get('[data-testid="search"]');
    resetApiCalls();

    for (const value of ['a', 'ad', 'ada', 'ada '] ) {
      await input.setValue(value);
      await vi.advanceTimersByTimeAsync(50);
    }
    await vi.advanceTimersByTimeAsync(300);

    expect(apiCalls.search).toBe(1);
    expect(app.wrapper.get('[data-testid="result-count"]').text()).toBe('1');
  });
});

describe('the live status panel', () => {
  it('follows the interval the user picked', async () => {
    using app = mountApp();
    resetApiCalls();

    await app.wrapper.get('[data-testid="interval"]').setValue('1000');
    await vi.advanceTimersByTimeAsync(1000);

    expect(apiCalls.status).toBe(1);
    expect(app.wrapper.get('[data-testid="ticks"]').text()).toBe('1');
  });

  it('stops polling once the dashboard is gone', async () => {
    const app = mountApp();
    await app.wrapper.get('[data-testid="interval"]').setValue('1000');
    app[Symbol.dispose]();
    resetApiCalls();

    await vi.advanceTimersByTimeAsync(5000);

    expect(apiCalls.status).toBe(0);
  });
});

describe('the fleet table', () => {
  it('re-sorts when the user picks another column', async () => {
    using app = mountApp();

    await app.wrapper.get('[data-testid="sort-battery"]').trigger('click');

    const firstRow = app.wrapper.findAll('[data-testid="fleet-row"]')[0]!;
    expect(firstRow.text()).toContain('QR-345-ST');
  });
});
