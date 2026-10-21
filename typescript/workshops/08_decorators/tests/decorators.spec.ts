import { beforeEach, describe, expect, test } from 'vitest';
import '../src/polyfill.ts';
import { Cart, auditLog, shippingQuotes } from '../src/cart.ts';
import { command, commandsOf, jsonString, logged, memoize, min } from '../src/decorators.ts';

beforeEach(() => {
  auditLog.length = 0;
  shippingQuotes.count = 0;
});

describe('@logged', () => {
  test('reports each call with its arguments and its result', () => {
    const cart = new Cart();
    cart.add('book', 20, 2);
    cart.add('pen', 2);
    expect(auditLog).toEqual(['add("book", 20, 2) → 1', 'add("pen", 2) → 2']);
  });

  test('keeps `this` and the return value of the method', () => {
    const lines: string[] = [];
    class Counter {
      count = 10;
      @logged((line) => lines.push(line))
      increment(by: number) {
        this.count += by;
        return this.count;
      }
    }
    expect(new Counter().increment(5)).toBe(15);
    expect(lines).toEqual(['increment(5) → 15']);
  });
});

describe('@memoize', () => {
  test('computes a result once per arguments', () => {
    const cart = new Cart();
    expect(cart.shippingTo('FR')).toBe(5);
    expect(cart.shippingTo('FR')).toBe(5);
    expect(cart.shippingTo('DE')).toBe(15);
    expect(shippingQuotes.count).toBe(2);
  });

  test('never shares its cache between two instances', () => {
    class Box {
      constructor(readonly size: number) {}
      @memoize
      area() {
        return this.size * this.size;
      }
    }
    expect(new Box(2).area()).toBe(4);
    expect(new Box(3).area()).toBe(9);
  });
});

describe('@min', () => {
  test('accepts a value at or above the minimum', () => {
    const cart = new Cart();
    cart.discount = 0;
    cart.discount = 5;
    expect(cart.discount).toBe(5);
  });

  test('refuses an assignment below the minimum, naming the field', () => {
    const cart = new Cart();
    expect(() => {
      cart.discount = -1;
    }).toThrow(new RangeError('discount must be >= 0, got -1'));
    expect(cart.discount).toBe(0);
  });

  test('refuses an initial value below the minimum', () => {
    class Stock {
      @min(1) accessor quantity = 0;
    }
    expect(() => new Stock()).toThrow('quantity must be >= 1, got 0');
  });
});

describe('@jsonString', () => {
  test('gives the instances a JSON toString', () => {
    const cart = new Cart();
    cart.add('pen', 2);
    expect(`${cart}`).toBe('{"lines":[{"sku":"pen","price":2,"quantity":1}]}');
  });

  test('works on any class', () => {
    @jsonString
    class Point {
      x = 1;
      y = 2;
    }
    expect(String(new Point())).toBe('{"x":1,"y":2}');
  });
});

describe('@command', () => {
  test('registers the commands of a class in its metadata', () => {
    expect(commandsOf(Cart)).toEqual({ add: 'add', total: 'total' });
  });

  test('keeps the registries of two classes apart', () => {
    class Git {
      @command('st') status() {}
      @command('co') checkout() {}
    }
    class Npm {
      @command('i') install() {}
    }
    expect(commandsOf(Git)).toEqual({ st: 'status', co: 'checkout' });
    expect(commandsOf(Npm)).toEqual({ i: 'install' });
  });

  test('returns an empty registry for a class without commands', () => {
    class Plain {}
    expect(commandsOf(Plain)).toEqual({});
  });
});

describe('Cart', () => {
  test('applies the discount to the total, never below zero', () => {
    const cart = new Cart();
    cart.add('book', 20, 2);
    cart.discount = 5;
    expect(cart.total()).toBe(35);
    cart.discount = 100;
    expect(cart.total()).toBe(0);
  });
});
