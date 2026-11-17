import { beforeEach, describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '../src/polyfill.ts';
import { CartStore, auditLog, shippingQuotes } from '../src/cart.ts';
import { CartView, CommandPalette, DiscountForm, ShippingQuote } from '../src/CartView.tsx';
import { command, commandsOf, jsonString, logged, memoize, min } from '../src/decorators.ts';

beforeEach(() => {
  auditLog.length = 0;
  shippingQuotes.count = 0;
});

/** Types a discount in the form of the cart view, and applies it. */
async function applyDiscount(value: string) {
  const user = userEvent.setup();
  await user.clear(screen.getByLabelText('Discount'));
  await user.type(screen.getByLabelText('Discount'), value);
  await user.click(screen.getByRole('button', { name: 'Apply' }));
}

describe('@logged', () => {
  test('reports each call made from a click, with its arguments and its result', async () => {
    const user = userEvent.setup();
    render(<CartView cart={new CartStore()} />);
    await user.click(screen.getByRole('button', { name: 'Add a book' }));
    await user.click(screen.getByRole('button', { name: 'Add a pen' }));
    expect(auditLog).toEqual(['add("book", 20) → 1', 'add("pen", 2) → 2']);
  });

  test('keeps `this` and the return value of the method', () => {
    const lines: string[] = [];
    class CounterStore {
      count = 10;
      @logged((line) => lines.push(line))
      increment(by: number) {
        this.count += by;
        return this.count;
      }
    }
    expect(new CounterStore().increment(5)).toBe(15);
    expect(lines).toEqual(['increment(5) → 15']);
  });
});

describe('@memoize', () => {
  test('computes a quote once per country, however many times the component renders', () => {
    const cart = new CartStore();
    const { rerender } = render(<ShippingQuote cart={cart} country="FR" />);
    rerender(<ShippingQuote cart={cart} country="FR" />);
    expect(screen.getByText('Shipping to FR: 5')).toBeTruthy();
    rerender(<ShippingQuote cart={cart} country="DE" />);
    expect(screen.getByText('Shipping to DE: 15')).toBeTruthy();
    expect(shippingQuotes.count).toBe(2);
  });

  test('never shares its cache between two instances', () => {
    class BoxStore {
      constructor(readonly size: number) {}
      @memoize
      area() {
        return this.size * this.size;
      }
    }
    expect(new BoxStore(2).area()).toBe(4);
    expect(new BoxStore(3).area()).toBe(9);
  });
});

describe('@min', () => {
  test('accepts a discount at or above the minimum', async () => {
    const cart = new CartStore();
    render(<DiscountForm cart={cart} />);
    await applyDiscount('5');
    expect(cart.discount).toBe(5);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  test('refuses a discount below the minimum, naming the field', async () => {
    const cart = new CartStore();
    render(<DiscountForm cart={cart} />);
    await applyDiscount('-1');
    expect(screen.getByRole('alert').textContent).toBe('discount must be >= 0, got -1');
    expect(cart.discount).toBe(0);
  });

  test('refuses an initial value below the minimum', () => {
    class StockStore {
      @min(1) accessor quantity = 0;
    }
    expect(() => new StockStore()).toThrow(new RangeError('quantity must be >= 1, got 0'));
  });
});

describe('@jsonString', () => {
  test('gives the store a JSON toString, shown in the debug panel', async () => {
    const user = userEvent.setup();
    render(<CartView cart={new CartStore()} />);
    await user.click(screen.getByRole('button', { name: 'Add a pen' }));
    expect(screen.getByLabelText('Debug').textContent).toBe('{"lines":[{"sku":"pen","price":2,"quantity":1}]}');
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
  test('registers the commands of a store, listed by the command palette', () => {
    render(<CommandPalette of={CartStore} />);
    const items = screen.getAllByRole('listitem').map((li) => li.textContent);
    expect(items).toEqual(['add → add', 'total → total']);
  });

  test('keeps the registries of two classes apart', () => {
    class EditorStore {
      @command('save') persist() {}
      @command('undo') revert() {}
    }
    class SearchStore {
      @command('find') search() {}
    }
    expect(commandsOf(EditorStore)).toEqual({ save: 'persist', undo: 'revert' });
    expect(commandsOf(SearchStore)).toEqual({ find: 'search' });
  });

  test('returns an empty registry for a class without commands', () => {
    class PlainStore {}
    expect(commandsOf(PlainStore)).toEqual({});
    render(<CommandPalette of={PlainStore} />);
    expect(screen.getByText('No commands')).toBeTruthy();
  });
});

describe('CartView', () => {
  test('applies the discount to the total, never below zero', async () => {
    const cart = new CartStore();
    cart.add('book', 20, 2);
    render(<CartView cart={cart} />);
    await applyDiscount('5');
    expect(screen.getByText('Total: 35')).toBeTruthy();
    await applyDiscount('100');
    expect(screen.getByText('Total: 0')).toBeTruthy();
  });
});
