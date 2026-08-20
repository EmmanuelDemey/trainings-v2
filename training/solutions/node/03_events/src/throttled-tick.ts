import { EventEmitter } from 'node:events';
import { fromEvent, throttleTime } from 'rxjs';
import type { Subscription } from 'rxjs';

/**
 * Same goal in both versions: a source emits `'tick'` rapidly, but we only want
 * to react at most once every `windowMs` milliseconds (throttling). Compare the
 * hand-written EventEmitter version with the declarative RxJS pipeline.
 *
 * Read the two side by side once they work. The hand-rolled one is six lines and
 * has no dependency; the RxJS one is one line and gives you `debounceTime`,
 * `auditTime`, `switchMap`, cancellation and back-pressure for the same price.
 * The question is never "which is shorter" but "how many more of these am I
 * going to write".
 */

/**
 * Version 1 — throttle by hand on top of an EventEmitter.
 *
 * Leading-edge throttling: the first tick of each window goes through
 * immediately, the rest are dropped until the window expires.
 */
export function throttledTickWithEmitter(
  source: EventEmitter,
  windowMs: number,
  onTick: (value: number) => void,
): () => void {
  let lastEmit = -Infinity;

  const handler = (value: number): void => {
    const now = Date.now();
    if (now - lastEmit < windowMs) return;
    lastEmit = now;
    onTick(value);
  };

  source.on('tick', handler);

  // Returning the teardown is the whole discipline: whoever wires a listener
  // owns removing it. `off` needs the same function reference we registered.
  return () => {
    source.off('tick', handler);
  };
}

/**
 * Version 2 — same behaviour with RxJS `fromEvent` + `throttleTime`.
 *
 * `fromEvent` attaches the listener on subscribe and detaches it on
 * unsubscribe, so the teardown below removes it from the emitter too.
 */
export function throttledTickWithRxjs(
  source: EventEmitter,
  windowMs: number,
  onTick: (value: number) => void,
): () => void {
  const sub: Subscription = fromEvent<number>(source, 'tick')
    .pipe(throttleTime(windowMs))
    .subscribe(onTick);

  return () => {
    sub.unsubscribe();
  };
}
