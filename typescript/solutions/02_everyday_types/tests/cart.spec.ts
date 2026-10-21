import { describe, expect, test } from 'vitest';
import { cartTotal, findProduct, formatPrice, lineTotal, parseQuantity, reserveStock, shippingFor } from '../src/cart.ts';
import { catalog, coffee, milk, tea } from './fixtures.ts';

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

describe('formatPrice', () => {
  test('formats euros by default', () => {
    expect(formatPrice(1250)).toBe('12.50 €');
  });

  test('formats dollars and pounds', () => {
    expect(formatPrice(1250, 'USD')).toBe('$12.50');
    expect(formatPrice(5, 'GBP')).toBe('£0.05');
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

describe('findProduct', () => {
  test('finds one product by its id', () => {
    expect(findProduct(catalog, 'tea')).toBe(tea);
  });

  test('gives undefined for an unknown id', () => {
    expect(findProduct(catalog, 'beer')).toBeUndefined();
  });

  test('finds several products from a list of ids', () => {
    expect(findProduct(catalog, ['milk', 'beer', 'coffee'])).toEqual([milk, coffee]);
  });
});

describe('reserveStock', () => {
  test('releases the stock at the end of the block', () => {
    const log: string[] = [];
    {
      using _reservation = reserveStock(milk, log);
      log.push('paid');
    }
    expect(log).toEqual(['reserved milk', 'paid', 'released milk']);
  });
});
