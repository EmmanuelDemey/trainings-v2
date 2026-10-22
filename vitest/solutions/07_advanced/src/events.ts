import type { StockEntry } from './inventory';

/** What happens in the shop, each event with its own payload. */
export interface ShopEvents {
  'book:sold': { isbn: string; quantity: number };
  'stock:low': StockEntry;
  'shop:closed': undefined;
}

type Listener<T> = T extends undefined ? () => void : (payload: T) => void;

/** A typed event bus: the payload of `emit` and of the listener follow the event name. */
export class EventBus<Events extends object> {
  #listeners = new Map<keyof Events, Set<(payload?: unknown) => void>>();

  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void {
    const listeners = this.#listeners.get(event) ?? new Set();
    listeners.add(listener as (payload?: unknown) => void);
    this.#listeners.set(event, listeners);
    return () => listeners.delete(listener as (payload?: unknown) => void);
  }

  emit<K extends keyof Events>(event: K, ...payload: Events[K] extends undefined ? [] : [Events[K]]): void {
    for (const listener of this.#listeners.get(event) ?? []) listener(payload[0]);
  }
}
