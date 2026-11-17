import { describe, expect, test } from 'vitest';
import { cartTotal, lineTotal, parseQuantity, shippingFor } from '../src/cart.ts';
import { coffee, milk, tea } from './fixtures.ts';

describe('shippingFor', () => {
  test('gives the fee of each currency', () => {
    expect(shippingFor('EUR')).toBe(490);
    expect(shippingFor('USD')).toBe(590);
    expect(shippingFor('GBP')).toBe(450);
  });
});

describe('lineTotal', () => {
  test('multiplies the price by the quantity', () => {
    expect(lineTotal([milk, 3])).toBe(387);
  });

  test('applies the discount', () => {
    expect(lineTotal([coffee, 2])).toBe(2000);
  });
});

describe('cartTotal', () => {
  test('adds up every line', () => {
    expect(cartTotal([milk, 3], [coffee, 2], [tea, 1])).toBe(2886);
  });

  test('is 0 for an empty cart', () => {
    expect(cartTotal()).toBe(0);
  });
});

describe('parseQuantity', () => {
  test('accepts a positive integer', () => {
    expect(parseQuantity(3)).toBe(3);
  });

  test('accepts a string of digits', () => {
    expect(parseQuantity('4')).toBe(4);
    expect(parseQuantity(' 2 ')).toBe(2);
  });

  test.each([0, -1, 1.5, 'abc', '', null, undefined, {}])('refuses %j', (input) => {
    expect(() => parseQuantity(input)).toThrow('Invalid quantity');
  });
});
