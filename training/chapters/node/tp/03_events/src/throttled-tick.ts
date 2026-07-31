import { EventEmitter } from 'node:events';
import { fromEvent, throttleTime } from 'rxjs';
import type { Subscription } from 'rxjs';

/**
 * Same goal in both versions: a source emits `'tick'` rapidly, but we only want
 * to react at most once every `windowMs` milliseconds (throttling). Compare the
 * hand-written EventEmitter version with the declarative RxJS pipeline.
 */

/**
 * Version 1 — throttle by hand on top of an EventEmitter.
 *
 * TODO: subscribe to `source`'s 'tick' event and forward to `onTick` only when
 * at least `windowMs` has elapsed since the last forwarded tick.
 */
export function throttledTickWithEmitter(
  source: EventEmitter,
  windowMs: number,
  onTick: (value: number) => void,
): () => void {
  // TODO: keep a `lastEmit` timestamp; on each 'tick', if Date.now() - lastEmit
  // >= windowMs, update it and call onTick(value).
  const handler = (_value: number): void => {
    // TODO
  };
  source.on('tick', handler);

  // Return an unsubscribe function. TODO: detach the listener with off.
  return () => {
    // TODO
  };
}

/**
 * Version 2 — same behaviour with RxJS `fromEvent` + `throttleTime`.
 *
 * TODO: build `fromEvent<number>(source, 'tick')`, pipe through
 * `throttleTime(windowMs)`, then subscribe with `onTick`.
 */
export function throttledTickWithRxjs(
  source: EventEmitter,
  windowMs: number,
  onTick: (value: number) => void,
): () => void {
  // TODO: const sub = fromEvent<number>(source, 'tick').pipe(throttleTime(windowMs)).subscribe(onTick);
  const sub: Subscription | undefined = undefined; // TODO

  return () => {
    sub?.unsubscribe();
  };
}
