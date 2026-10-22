import { describe, expect, test } from 'vitest';
import { formatPrice, priceInCents } from './price';

describe('formatPrice', () => {
  test('formats cents as euros, with two decimals', () => {
    expect(formatPrice(1250)).toBe('€12.50');
  });

  test('keeps the trailing zeros of a round price', () => {
    expect(formatPrice(800)).toBe('€8.00');
  });

  test('formats a free book', () => {
    expect(formatPrice(0)).toBe('€0.00');
  });
});

describe('priceInCents', () => {
  test('reads a price with two decimals', () => {
    expect(priceInCents('12.50')).toBe(1250);
  });

  test('reads a price with one decimal', () => {
    expect(priceInCents('12.5')).toBe(1250);
  });

  test('reads a price with no decimals', () => {
    expect(priceInCents('8')).toBe(800);
  });

  test('ignores the spaces around the price', () => {
    expect(priceInCents(' 9.99 ')).toBe(999);
  });

  test('refuses what is not a price', () => {
    expect(() => priceInCents('twelve')).toThrow('Not a price: "twelve"');
  });
});
