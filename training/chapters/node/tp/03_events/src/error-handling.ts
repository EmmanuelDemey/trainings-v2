import { EventEmitter } from 'node:events';

/**
 * Demonstrates the special `error` event and listener lifecycle.
 *
 * An `EventEmitter` that emits `'error'` with no listener will THROW and can
 * crash the process. Always wire an `error` listener on emitters that may fail.
 */
export function demoErrorHandling(): void {
  const emitter = new EventEmitter();

  // TODO: register an `error` listener so emitting 'error' does not crash.
  // emitter.on('error', (err) => { ... });

  // TODO: register a ONE-SHOT listener with `once` for a 'ready' event,
  // and verify it only fires the first time 'ready' is emitted.

  // TODO: register a named handler for a 'tick' event, then detach it with
  // `off` (or removeListener) to prove the listener no longer fires.
  // const onTick = () => { ... };
  // emitter.on('tick', onTick);
  // emitter.off('tick', onTick);

  // TODO: emit the events above to exercise each path safely.
}
