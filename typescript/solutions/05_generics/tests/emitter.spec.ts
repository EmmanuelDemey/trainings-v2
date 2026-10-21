import { describe, expect, test, vi } from 'vitest';
import { Emitter } from '../src/emitter.ts';

interface ShopEvents {
  added: { sku: string; quantity: number };
  cleared: undefined;
}

describe('Emitter', () => {
  test('calls the listeners of an event with its payload', () => {
    const emitter = new Emitter<ShopEvents>();
    const listener = vi.fn();
    emitter.on('added', listener);
    emitter.emit('added', { sku: 'TS-7', quantity: 2 });
    expect(listener).toHaveBeenCalledWith({ sku: 'TS-7', quantity: 2 });
  });

  test('does not call the listeners of another event', () => {
    const emitter = new Emitter<ShopEvents>();
    const listener = vi.fn();
    emitter.on('cleared', listener);
    emitter.emit('added', { sku: 'TS-7', quantity: 2 });
    expect(listener).not.toHaveBeenCalled();
  });

  test('stops calling a listener once unsubscribed', () => {
    const emitter = new Emitter<ShopEvents>();
    const listener = vi.fn();
    const off = emitter.on('cleared', listener);
    off();
    emitter.emit('cleared', undefined);
    expect(listener).not.toHaveBeenCalled();
  });
});
