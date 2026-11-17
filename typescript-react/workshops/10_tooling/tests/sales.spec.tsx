import { describe, expect, test } from 'vitest';
import { average, formatTotal, topSeller, totalsByRegion } from '../src/sales.ts';
import { sales } from './fixtures.ts';

describe('average', () => {
  test('averages the amounts', () => {
    expect(average(sales)).toBe(16.25);
  });

  test('is 0 without sales', () => {
    expect(average([])).toBe(0);
  });
});

describe('topSeller', () => {
  test('finds the biggest sale', () => {
    expect(topSeller(sales)).toBe('lamp');
  });

  test('is undefined without sales — it does not throw', () => {
    expect(topSeller([])).toBeUndefined();
  });
});

describe('totalsByRegion', () => {
  test('adds up the amounts of each region', () => {
    expect(totalsByRegion(sales)).toEqual({ north: 28, unknown: 2, south: 35 });
  });
});

describe('formatTotal', () => {
  test('defaults to two decimals, in euros', () => {
    expect(formatTotal(sales)).toBe('Total: 65.00 EUR');
  });

  test('takes a currency and a number of decimals', () => {
    expect(formatTotal(sales, { currency: 'USD', decimals: 0 })).toBe('Total: 65 USD');
  });
});
