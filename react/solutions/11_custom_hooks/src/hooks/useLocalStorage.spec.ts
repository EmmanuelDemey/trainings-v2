import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useLocalStorage } from './useLocalStorage';

const NONE: string[] = [];

describe('useLocalStorage', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('returns the initial value when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorage('favorites', NONE));

    expect(result.current[0]).toEqual([]);
  });

  it('returns what is already stored, parsed from JSON', () => {
    localStorage.setItem('favorites', JSON.stringify(['1', '5']));

    const { result } = renderHook(() => useLocalStorage('favorites', NONE));

    expect(result.current[0]).toEqual(['1', '5']);
  });

  it('falls back to the initial value when the stored JSON is corrupted', () => {
    localStorage.setItem('favorites', '{not json');

    const { result } = renderHook(() => useLocalStorage('favorites', NONE));

    expect(result.current[0]).toEqual([]);
  });

  it('stores the new value as JSON, and returns it', () => {
    const { result } = renderHook(() => useLocalStorage('favorites', NONE));

    act(() => result.current[1](['4']));

    expect(result.current[0]).toEqual(['4']);
    expect(localStorage.getItem('favorites')).toBe('["4"]');
  });

  it('accepts an updater function, like useState', () => {
    const { result } = renderHook(() => useLocalStorage('favorites', NONE));

    act(() => result.current[1]((ids) => [...ids, '1']));
    act(() => result.current[1]((ids) => [...ids, '5']));

    expect(result.current[0]).toEqual(['1', '5']);
  });

  it('keeps two components using the same key in sync', () => {
    const first = renderHook(() => useLocalStorage('favorites', NONE));
    const second = renderHook(() => useLocalStorage('favorites', NONE));

    act(() => first.result.current[1](['10']));

    expect(second.result.current[0]).toEqual(['10']);
  });

  it('does not mix two keys', () => {
    const favorites = renderHook(() => useLocalStorage('favorites', NONE));
    const theme = renderHook(() => useLocalStorage('theme', 'light'));

    act(() => favorites.result.current[1](['10']));

    expect(theme.result.current[0]).toBe('light');
  });

  it('follows a change made in another tab (the storage event)', () => {
    const { result } = renderHook(() => useLocalStorage('favorites', NONE));

    // What the browser does when ANOTHER tab writes: the value is already
    // stored, and this tab only receives the event.
    act(() => {
      localStorage.setItem('favorites', '["2","3"]');
      window.dispatchEvent(new StorageEvent('storage', { key: 'favorites', newValue: '["2","3"]' }));
    });

    expect(result.current[0]).toEqual(['2', '3']);
  });
});
