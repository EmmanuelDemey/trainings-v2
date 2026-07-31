import { EventEmitter } from 'node:events';

/** A minimal order from the domain. */
export interface Order {
  id: string;
  amount: number;
  currency: string;
}

/**
 * Event map: each key is an event name, each value is the tuple of arguments
 * passed to listeners. `EventEmitter<Map>` checks `emit` / `on` against it.
 *
 * TODO: complete the payloads.
 */
export interface OrderEvents {
  'order:created': [order: Order];
  // TODO: 'order:paid' should carry the order and the paid amount.
  'order:paid': [/* TODO */];
}

/**
 * A typed emitter for the order domain.
 *
 * TODO: extend EventEmitter<OrderEvents> and expose typed helpers.
 */
export class OrderEmitter extends EventEmitter<OrderEvents> {
  /** Emit `order:created`. TODO: forward to `this.emit(...)`. */
  created(order: Order): void {
    // TODO
  }

  /** Emit `order:paid`. TODO: forward to `this.emit(...)`. */
  paid(/* TODO: params */): void {
    // TODO
  }

  /** Subscribe to `order:created`. TODO: forward to `this.on(...)`. */
  onCreated(listener: (order: Order) => void): this {
    // TODO
    return this;
  }
}
