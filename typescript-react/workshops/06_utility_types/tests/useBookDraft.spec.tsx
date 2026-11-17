import { describe, expect, test } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useBookDraft } from '../src/useBookDraft.ts';
import { dune } from './fixtures.ts';

describe('useBookDraft', () => {
  test('applies the changes', () => {
    const { result } = renderHook(() => useBookDraft(dune));
    act(() => result.current.change({ title: 'Dune Messiah' }));
    expect(result.current.result.title).toBe('Dune Messiah');
  });

  test('keeps the fields the draft does not mention', () => {
    const { result } = renderHook(() => useBookDraft(dune));
    act(() => result.current.change({ title: 'Dune Messiah' }));
    expect(result.current.result.author).toBe('Frank Herbert');
  });

  test('leaves the original book untouched', () => {
    const { result } = renderHook(() => useBookDraft(dune));
    act(() => result.current.change({ title: 'Dune Messiah' }));
    expect(dune.title).toBe('Dune');
  });
});
