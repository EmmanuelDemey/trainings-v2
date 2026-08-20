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
 * Naming the tuple members (`[order: Order]`) is not decoration: those names
 * show up in the editor when you write the listener, so the callback signature
 * documents itself.
 */
export interface OrderEvents {
  'order:created': [order: Order];
  'order:paid': [order: Order, paidAmount: number];
}

/**
 * A typed emitter for the order domain.
 *
 * The generic parameter is what buys the safety: `this.emit('order:paid', order)`
 * no longer compiles (missing argument), and `onPaid` receives a typed `order`
 * without a single annotation at the call site. Try breaking one on purpose and
 * run `npm run typecheck`.
 *
 * The thin `created` / `onCreated` wrappers are worth the lines: callers never
 * type the event name as a string, so a typo is a compile error rather than a
 * listener that silently never fires.
 */
export class OrderEmitter extends EventEmitter<OrderEvents> {
  /** Emit `order:created`. */
  created(order: Order): void {
    this.emit('order:created', order);
  }

  /** Emit `order:paid`. */
  paid(order: Order, paidAmount: number): void {
    this.emit('order:paid', order, paidAmount);
  }

  /** Subscribe to `order:created`. */
  onCreated(listener: (order: Order) => void): this {
    return this.on('order:created', listener);
  }

  /** Subscribe to `order:paid`. */
  onPaid(listener: (order: Order, paidAmount: number) => void): this {
    return this.on('order:paid', listener);
  }
}
