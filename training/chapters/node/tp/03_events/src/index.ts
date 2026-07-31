import { EventEmitter } from 'node:events';
import { OrderEmitter } from './order-events.ts';
import type { Order } from './order-events.ts';
import { demoErrorHandling } from './error-handling.ts';
import {
  throttledTickWithEmitter,
  throttledTickWithRxjs,
} from './throttled-tick.ts';

// --- Task 1: typed domain emitter ------------------------------------------
const orders = new OrderEmitter();
orders.onCreated((order: Order) => {
  console.log('[order:created]', order.id);
});
// TODO: also subscribe to 'order:paid' and emit a created + paid order.

// --- Task 2: error handling & cleanup --------------------------------------
demoErrorHandling();

// --- Task 3: throttled tick, EventEmitter vs RxJS --------------------------
function runThrottleDemo(
  label: string,
  wire: (
    source: EventEmitter,
    windowMs: number,
    onTick: (value: number) => void,
  ) => () => void,
): void {
  const source = new EventEmitter();
  const stop = wire(source, 200, (value) => {
    console.log(`[${label}] tick ${value}`);
  });

  let n = 0;
  const interval = setInterval(() => source.emit('tick', n++), 50);
  setTimeout(() => {
    clearInterval(interval);
    stop();
  }, 1_000);
}

runThrottleDemo('emitter', throttledTickWithEmitter);
runThrottleDemo('rxjs', throttledTickWithRxjs);
