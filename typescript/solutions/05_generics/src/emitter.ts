// An event emitter whose events are a type: one key per event name, its value
// the payload the listeners receive.

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
