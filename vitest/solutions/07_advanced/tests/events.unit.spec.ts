import { describe, expect, test, vi } from 'vitest';
import { EventBus, type ShopEvents } from '../src/events';

describe('EventBus', () => {
  test('calls the listeners of an event with its payload', () => {
    const bus = new EventBus<ShopEvents>();
    const listener = vi.fn();
    bus.on('book:sold', listener);

    bus.emit('book:sold', { isbn: '9780132350884', quantity: 2 });

    expect(listener).toHaveBeenCalledExactlyOnceWith({ isbn: '9780132350884', quantity: 2 });
  });

  test('does not call the listeners of another event', () => {
    const bus = new EventBus<ShopEvents>();
    const listener = vi.fn();
    bus.on('shop:closed', listener);

    bus.emit('book:sold', { isbn: '9780132350884', quantity: 1 });

    expect(listener).not.toHaveBeenCalled();
  });

  test('stops calling a listener once unsubscribed', () => {
    const bus = new EventBus<ShopEvents>();
    const listener = vi.fn();
    const off = bus.on('shop:closed', listener);

    off();
    bus.emit('shop:closed');

    expect(listener).not.toHaveBeenCalled();
  });
});
