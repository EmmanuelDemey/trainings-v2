// Checked by the compiler, never run: what the EventBus lets through, and what
// it must refuse.
import { describe, expectTypeOf, test } from 'vitest';
import { EventBus, type ShopEvents } from '../src/events';
import type { StockEntry } from '../src/inventory';

describe('EventBus types', () => {
  const bus = new EventBus<ShopEvents>();

  test('the listener receives the payload of its event', () => {
    bus.on('book:sold', (payload) => {
      expectTypeOf(payload).toEqualTypeOf<{ isbn: string; quantity: number }>();
    });
    bus.on('stock:low', (entry) => {
      expectTypeOf(entry).toEqualTypeOf<StockEntry>();
    });
  });

  test('on returns the function that unsubscribes', () => {
    expectTypeOf(bus.on('shop:closed', () => {})).toEqualTypeOf<() => void>();
  });

  test('an event without payload is emitted without argument', () => {
    expectTypeOf(bus.emit<'shop:closed'>).parameters.toEqualTypeOf<['shop:closed']>();
  });

  test('emit refuses a wrong payload, an unknown event, a missing payload', () => {
    // @ts-expect-error quantity must be a number
    bus.emit('book:sold', { isbn: '9780132350884', quantity: '2' });
    // @ts-expect-error not an event of the shop
    bus.emit('book:stolen', { isbn: '9780132350884' });
    // @ts-expect-error book:sold needs its payload
    bus.emit('book:sold');
  });

  test('the payloads of the shop all extend object, or are undefined', () => {
    expectTypeOf<ShopEvents[keyof ShopEvents]>().toExtend<object | undefined>();
  });
});
