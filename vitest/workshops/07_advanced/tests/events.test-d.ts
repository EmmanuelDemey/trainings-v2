// TODO — Step 3. Checked by the compiler, never run: what the EventBus lets
// through, and what it must refuse. Run once Step 2 enabled the typecheck.
import { describe, expectTypeOf, test } from 'vitest';
import { EventBus, type ShopEvents } from '../src/events';
import type { StockEntry } from '../src/inventory';

describe('EventBus types', () => {
  const bus = new EventBus<ShopEvents>();

  test('the listener receives the payload of its event', () => {
    bus.on('book:sold', (payload) => {
      expectTypeOf(payload).toEqualTypeOf<{ isbn: string; quantity: number }>();
    });
    // TODO: and the listener of stock:low receives a StockEntry
  });

  test.todo('on returns the function that unsubscribes');
  test.todo('an event without payload is emitted without argument');
  test.todo('emit refuses a wrong payload, an unknown event, a missing payload — @ts-expect-error');
  test.todo('the payloads of the shop all extend object, or are undefined');
});
