import { describe, expect, test } from 'vitest';
import { applyCoupon } from './coupon';

describe('applyCoupon', () => {
  test.each([
    { code: 'SAVE10', total: 5000, expected: 4500 },
    { code: 'SAVE10', total: 999, expected: 899 },
    { code: 'HALF', total: 4000, expected: 2000 },
    { code: 'HALF', total: 4999, expected: 2499 },
    { code: 'FIVEOFF', total: 3990, expected: 3490 },
    { code: 'FIVEOFF', total: 300, expected: 0 },
  ])('$code on $total cents gives $expected', ({ code, total, expected }) => {
    expect(applyCoupon(total, code)).toBe(expected);
  });

  test('reads the code case-insensitively', () => {
    expect(applyCoupon(5000, 'save10')).toBe(4500);
  });

  test('refuses HALF under €40.00', () => {
    expect(() => applyCoupon(3999, 'HALF')).toThrow('HALF needs a cart of €40.00 or more');
  });

  test('refuses an unknown code', () => {
    expect(() => applyCoupon(5000, 'FREEBOOKS')).toThrow(/unknown coupon/i);
  });
});
