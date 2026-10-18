import { afterEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { THEME_MODE_KEY, useThemeMode } from './useThemeMode';

afterEach(() => {
  localStorage.clear();
});

describe('step 2 — useThemeMode', () => {
  it('starts in light mode when the user never chose', () => {
    const { result } = renderHook(() => useThemeMode());

    expect(result.current[0]).toBe('light');
  });

  it('toggles between light and dark', () => {
    const { result } = renderHook(() => useThemeMode());

    act(() => result.current[1]());
    expect(result.current[0]).toBe('dark');

    act(() => result.current[1]());
    expect(result.current[0]).toBe('light');
  });

  it('remembers the choice in localStorage', () => {
    const { result } = renderHook(() => useThemeMode());

    act(() => result.current[1]());

    expect(localStorage.getItem(THEME_MODE_KEY)).toBe('dark');
  });

  it('starts with the mode chosen last time', () => {
    localStorage.setItem(THEME_MODE_KEY, 'dark');

    const { result } = renderHook(() => useThemeMode());

    expect(result.current[0]).toBe('dark');
  });

  it('ignores a value it did not write', () => {
    localStorage.setItem(THEME_MODE_KEY, 'purple');

    const { result } = renderHook(() => useThemeMode());

    expect(result.current[0]).toBe('light');
  });
});
