import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';
import { useDebounced, usePolling } from '@/packages/acme';
import { withScope } from './helpers';

/**
 * The library's own specs. They are what a shared package owes its consumers:
 * the signature accepts what it advertises, the return value survives
 * destructuring, and the effects clean themselves up.
 */

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useDebounced — convention 1, the signature', () => {
  it('accepts a plain value', () => {
    using ctx = withScope(() => useDebounced('ada'));

    expect(ctx.result.value.value).toBe('ada');
  });

  it('accepts a ref, and follows it', async () => {
    const source = ref('ada');
    using ctx = withScope(() => useDebounced(source));

    source.value = 'grace';
    await vi.advanceTimersByTimeAsync(300);

    expect(ctx.result.value.value).toBe('grace');
  });

  it('accepts a getter, and follows it', async () => {
    const source = ref('ada');
    using ctx = withScope(() => useDebounced(() => source.value.toUpperCase()));

    source.value = 'grace';
    await vi.advanceTimersByTimeAsync(300);

    expect(ctx.result.value.value).toBe('GRACE');
  });

  it('resolves its delay once, from the options object', async () => {
    const source = ref('ada');
    using ctx = withScope(() => useDebounced(source, { delay: 1000 }));

    source.value = 'grace';
    await vi.advanceTimersByTimeAsync(999);
    expect(ctx.result.value.value).toBe('ada');

    await vi.advanceTimersByTimeAsync(1);
    expect(ctx.result.value.value).toBe('grace');
  });
});

describe('useDebounced — the behaviour', () => {
  it('publishes the last value only, however many changes it saw', async () => {
    const source = ref('a');
    using ctx = withScope(() => useDebounced(source));

    for (const next of ['ab', 'abc', 'abcd']) {
      source.value = next;
      await vi.advanceTimersByTimeAsync(50);
    }
    expect(ctx.result.value.value).toBe('a');

    await vi.advanceTimersByTimeAsync(300);
    expect(ctx.result.value.value).toBe('abcd');
  });

  it('reports that something is pending', async () => {
    const source = ref('a');
    using ctx = withScope(() => useDebounced(source));

    source.value = 'b';
    await nextTick();
    expect(ctx.result.pending.value).toBe(true);

    await vi.advanceTimersByTimeAsync(300);
    expect(ctx.result.pending.value).toBe(false);
  });

  it('publishes immediately on flush()', async () => {
    const source = ref('a');
    using ctx = withScope(() => useDebounced(source));

    source.value = 'b';
    await nextTick();
    ctx.result.flush();

    expect(ctx.result.value.value).toBe('b');
    expect(ctx.result.pending.value).toBe(false);
  });

  it('drops the pending change on cancel()', async () => {
    const source = ref('a');
    using ctx = withScope(() => useDebounced(source));

    source.value = 'b';
    await nextTick();
    ctx.result.cancel();
    await vi.advanceTimersByTimeAsync(300);

    expect(ctx.result.value.value).toBe('a');
  });
});

describe('useDebounced — convention 3, own your effects', () => {
  it('cancels its pending timer when the scope is disposed', async () => {
    const source = ref('a');
    const ctx = withScope(() => useDebounced(source));

    source.value = 'b';
    await nextTick();
    ctx.dispose();
    await vi.advanceTimersByTimeAsync(300);

    expect(ctx.result.value.value).toBe('a');
  });
});

describe('usePolling', () => {
  it('runs the task on every interval', async () => {
    const task = vi.fn();
    using ctx = withScope(() => usePolling(task, { interval: 1000 }));

    await vi.advanceTimersByTimeAsync(3000);

    expect(task).toHaveBeenCalledTimes(3);
    expect(ctx.result.ticks.value).toBe(3);
    expect(ctx.result.isActive.value).toBe(true);
  });

  it('runs once straight away when asked to', async () => {
    const task = vi.fn();
    using _ctx = withScope(() => usePolling(task, { interval: 1000, immediate: true }));

    await nextTick();

    expect(task).toHaveBeenCalledTimes(1);
  });

  it('stops and starts again without stacking timers', async () => {
    const task = vi.fn();
    using ctx = withScope(() => usePolling(task, { interval: 1000 }));

    ctx.result.stop();
    expect(ctx.result.isActive.value).toBe(false);
    await vi.advanceTimersByTimeAsync(3000);
    expect(task).not.toHaveBeenCalled();

    ctx.result.start();
    ctx.result.start();
    await vi.advanceTimersByTimeAsync(1000);

    expect(task).toHaveBeenCalledTimes(1);
  });

  it('follows a reactive interval', async () => {
    const task = vi.fn();
    const interval = ref(1000);
    using _ctx = withScope(() => usePolling(task, { interval }));

    await vi.advanceTimersByTimeAsync(1000);
    expect(task).toHaveBeenCalledTimes(1);

    interval.value = 100;
    await nextTick();
    await vi.advanceTimersByTimeAsync(300);

    expect(task).toHaveBeenCalledTimes(4);
  });

  it('stops itself when the scope is disposed — not only when a component unmounts', async () => {
    const task = vi.fn();
    const ctx = withScope(() => usePolling(task, { interval: 1000 }));

    ctx.dispose();
    await vi.advanceTimersByTimeAsync(5000);

    expect(task).not.toHaveBeenCalled();
  });

  it('warns the caller when there is no scope to clean up after it', () => {
    using warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const poll = usePolling(() => {}, { interval: 1000 });
    poll.stop();

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('stop()'));
  });
});
