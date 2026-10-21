// An event emitter whose events are a type: one key per event name, its value
// the payload the listeners receive.

export type Listener<P> = (payload: P) => void;

/** TODO 6: `Emitter<ShopEvents>` only knows the events of `ShopEvents`, each with its payload. */
export class Emitter<Events = any> {
  readonly #listeners: Record<string, Listener<any>[]> = {};

  /** Subscribes to one event. Returns the function that unsubscribes. */
  on(event: string, listener: Listener<any>): () => void {
    return () => {};
  }

  emit(event: string, payload: any): void {}
}
