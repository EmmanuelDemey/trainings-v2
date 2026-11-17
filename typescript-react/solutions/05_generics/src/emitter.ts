// An event emitter whose events are a type: one key per event name, its value
// the payload the listeners receive — and the hook that subscribes a component.
import { useEffect, useRef } from 'react';

export type Listener<P> = (payload: P) => void;

export class Emitter<Events extends object> {
  readonly #listeners: { [K in keyof Events]?: Listener<Events[K]>[] } = {};

  /** Subscribes to one event. Returns the function that unsubscribes. */
  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void {
    (this.#listeners[event] ??= []).push(listener);
    return () => {
      this.#listeners[event] = this.#listeners[event]?.filter((l) => l !== listener);
    };
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    this.#listeners[event]?.forEach((listener) => listener(payload));
  }
}

/** Calls `listener` on each `event` while the component is mounted. */
export function useEvent<Events extends object, K extends keyof Events>(
  emitter: Emitter<Events>,
  event: K,
  listener: Listener<Events[K]>,
): void {
  const latest = useRef(listener);
  latest.current = listener;
  useEffect(() => emitter.on(event, (payload) => latest.current(payload)), [emitter, event]);
}
