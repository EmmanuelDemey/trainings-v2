import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FilterProvider, useFilter } from './FilterContext';

describe('FilterContext', () => {
  it('starts with an empty filter', () => {
    const { result } = renderHook(() => useFilter(), { wrapper: FilterProvider });

    expect(result.current.filter).toBe('');
  });

  it('shares the filter set by one consumer', () => {
    const { result } = renderHook(() => useFilter(), { wrapper: FilterProvider });

    act(() => result.current.setFilter('sky'));

    expect(result.current.filter).toBe('sky');
  });

  it('throws a helpful error when used outside its provider', () => {
    // React logs the error thrown while rendering: keep the output clean.
    using _consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useFilter())).toThrow('useFilter must be used inside a <FilterProvider>');
  });
});
