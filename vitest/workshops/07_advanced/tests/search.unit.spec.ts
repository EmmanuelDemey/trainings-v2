import { describe, expect, test } from 'vitest';
import { binaryFind, linearFind } from '../src/search';
import { STOCK } from './fixtures';

describe.each([
  ['linearFind', linearFind],
  ['binaryFind', binaryFind],
])('%s', (_, find) => {
  test.each(STOCK)('finds $title', (entry) => {
    expect(find(STOCK, entry.isbn)).toBe(entry);
  });

  test('returns undefined for an ISBN that is not there', () => {
    expect(find(STOCK, '9780000000000')).toBeUndefined();
    expect(find([], '9780132350884')).toBeUndefined();
  });
});
