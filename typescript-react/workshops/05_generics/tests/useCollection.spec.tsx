import { describe, expect, test } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useCollection } from '../src/useCollection.ts';
import { ada, alan, type User } from './fixtures.ts';

describe('useCollection', () => {
  test('finds a saved entity by its id', () => {
    const { result } = renderHook(() => useCollection<User>());
    act(() => result.current.save(ada));
    expect(result.current.findById('u1')).toEqual(ada);
  });

  test('returns undefined for an unknown id', () => {
    const { result } = renderHook(() => useCollection<User>());
    expect(result.current.findById('nope')).toBeUndefined();
  });

  test('lists every entity saved', () => {
    const { result } = renderHook(() => useCollection<User>());
    act(() => {
      result.current.save(ada);
      result.current.save(alan);
    });
    expect(result.current.items).toEqual([ada, alan]);
  });

  test('replaces the entity that has the same id', () => {
    const { result } = renderHook(() => useCollection([ada]));
    act(() => result.current.save({ ...ada, age: 37 }));
    expect(result.current.items).toEqual([{ ...ada, age: 37 }]);
  });

  test('updates some fields of a stored entity', () => {
    const { result } = renderHook(() => useCollection([ada]));
    act(() => result.current.update('u1', { role: 'member' }));
    expect(result.current.findById('u1')).toEqual({ ...ada, role: 'member' });
  });

  test('refuses to update an unknown id', () => {
    const { result } = renderHook(() => useCollection<User>());
    expect(() => result.current.update('nope', { age: 1 })).toThrow('No entity with id nope');
  });
});
