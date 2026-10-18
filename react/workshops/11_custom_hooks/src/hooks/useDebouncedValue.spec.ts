import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebouncedValue } from './useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the initial value straight away', () => {
    const { result } = renderHook(() => useDebouncedValue('luke', 300));

    expect(result.current).toBe('luke');
  });

  it('keeps the previous value until the delay has elapsed', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'l' },
    });

    rerender({ value: 'lu' });
    act(() => vi.advanceTimersByTime(299));

    expect(result.current).toBe('l');
  });

  it('takes the new value once the delay has elapsed', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'l' },
    });

    rerender({ value: 'lu' });
    act(() => vi.advanceTimersByTime(300));

    expect(result.current).toBe('lu');
  });

  it('restarts the delay on every change, and only keeps the last value', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: '' },
    });

    rerender({ value: 'l' });
    act(() => vi.advanceTimersByTime(200));
    rerender({ value: 'le' });
    act(() => vi.advanceTimersByTime(200));
    rerender({ value: 'lei' });
    act(() => vi.advanceTimersByTime(200));

    // 600 ms since the first keystroke, but never 300 ms of silence.
    expect(result.current).toBe('');

    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe('lei');
  });

  it('waits 300 ms when no delay is given', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value), {
      initialProps: { value: 1 },
    });

    rerender({ value: 2 });
    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe(1);

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(2);
  });
});
