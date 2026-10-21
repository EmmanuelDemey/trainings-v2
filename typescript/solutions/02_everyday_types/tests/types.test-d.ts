import { describe, expectTypeOf, test } from 'vitest';
import { findProduct, SHIPPING } from '../src/cart.ts';
import type { CartLine, Currency, Product } from '../src/cart.ts';
import { catalog } from './fixtures.ts';

describe('Product', () => {
  test('has a readonly id, readonly tags and an optional discount', () => {
    expectTypeOf<Product>().toEqualTypeOf<{
      readonly id: string;
      name: string;
      price: number;
      tags: readonly string[];
      discount?: number;
    }>();
  });
});

describe('Currency', () => {
  test('is the union of the currencies, derived from CURRENCIES', () => {
    expectTypeOf<Currency>().toEqualTypeOf<'EUR' | 'USD' | 'GBP'>();
  });
});

describe('SHIPPING', () => {
  test('keeps its own keys, checked against Currency', () => {
    expectTypeOf(SHIPPING).toEqualTypeOf<{ EUR: number; USD: number; GBP: number }>();
  });
});

describe('CartLine', () => {
  test('is a tuple: a product, then a quantity', () => {
    expectTypeOf<CartLine>().toEqualTypeOf<[Product, number]>();
  });
});

describe('findProduct', () => {
  test('gives one product, or undefined, for one id', () => {
    expectTypeOf(findProduct(catalog, 'tea')).toEqualTypeOf<Product | undefined>();
  });

  test('gives a list of products for a list of ids', () => {
    expectTypeOf(findProduct(catalog, ['tea'])).toEqualTypeOf<Product[]>();
  });
});
