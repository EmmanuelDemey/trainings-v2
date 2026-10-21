// A typed event bus. Given — do not change this file.
//
// `EventMap` is empty on purpose: every module that publishes events adds its
// own to it, by module augmentation. `on` and `emit` only accept the names it
// lists, each with its own payload.

export interface EventMap {}

type Listener<Payload> = (payload: Payload) => void;

const listeners = new Map<PropertyKey, Listener<never>[]>();

/** Every event emitted so far, in order — handy in a test. */
export const history: { name: PropertyKey; payload: unknown }[] = [];

export function on<Name extends keyof EventMap>(name: Name, listener: Listener<EventMap[Name]>): void {
  listeners.set(name, [...(listeners.get(name) ?? []), listener as Listener<never>]);
}

export function emit<Name extends keyof EventMap>(name: Name, payload: EventMap[Name]): void {
  history.push({ name, payload });
  for (const listener of listeners.get(name) ?? []) (listener as Listener<EventMap[Name]>)(payload);
}
