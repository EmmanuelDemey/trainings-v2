import { describe, expect, test } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGroupBy } from '../src/useGroupBy.ts';
import { ada, alan, grace, users, type User } from './fixtures.ts';

const byRole = (user: User) => user.role;

describe('useGroupBy', () => {
  test('groups the items by the computed key', () => {
    const { result } = renderHook(() => useGroupBy(users, byRole));
    expect(result.current).toEqual({ admin: [ada], member: [alan, grace] });
  });

  test('keeps the order of the items in each group', () => {
    const { result } = renderHook(() => useGroupBy([grace, alan], byRole));
    expect(result.current.member).toEqual([grace, alan]);
  });

  test('has no group for a key no item has', () => {
    const { result } = renderHook(() => useGroupBy([ada], byRole));
    expect(result.current).not.toHaveProperty('member');
  });

  test('returns the same object while the inputs do not change', () => {
    const { result, rerender } = renderHook(() => useGroupBy(users, byRole));
    const before = result.current;
    rerender();
    expect(result.current).toBe(before);
  });
});
