import { describe, expect, test } from 'vitest';
import { first, groupBy, pluck } from '../src/collections.ts';
import { ada, alan, grace, users } from './fixtures.ts';

describe('first', () => {
  test('returns the first item', () => {
    expect(first(users)).toBe(ada);
  });

  test('returns undefined for an empty list', () => {
    expect(first([])).toBeUndefined();
  });
});

describe('pluck', () => {
  test('reads one key on every item', () => {
    expect(pluck(users, 'name')).toEqual(['Ada', 'Alan', 'Grace']);
  });
});

describe('groupBy', () => {
  test('groups the items by the computed key', () => {
    expect(groupBy(users, (user) => user.role)).toEqual({ admin: [ada], member: [alan, grace] });
  });

  test('keeps the order of the items in each group', () => {
    expect(groupBy([grace, alan], (user) => user.role).member).toEqual([grace, alan]);
  });

  test('has no group for a key no item has', () => {
    expect(groupBy([ada], (user) => user.role)).not.toHaveProperty('member');
  });
});
