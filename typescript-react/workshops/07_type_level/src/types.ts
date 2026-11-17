// Type-level tools for components, written from scratch: mapped, conditional,
// template literal and recursive types.
//
// Each one is a placeholder that compiles but says nothing. Write the real one
// — without the built-in utility types, unless the step allows it.
import type { JSXElementConstructor } from 'react';

// TODO 1: mapped types

/** Every property readonly, at every depth — arrays included. Handy for props and state. */
export type DeepReadonly<T> = T;

/** The opposite of Readonly: every property writable again. */
export type Mutable<T> = T;

/** Only the props listed are optional; the others are kept as they are. */
export type PartialBy<T, K extends keyof T> = T;

// TODO 2: key remapping

/** `{ onAdd: (payload) => void, … }` — one callback prop per event, named after it. */
export type Handlers<Events> = Record<string, (payload: unknown) => void>;

/** The props whose value is a function: the callbacks. */
export type CallbackKeys<T> = keyof T;

// TODO 3: conditional types and infer

/** The type a Promise resolves to — unwrapped as deep as it goes. */
export type Unwrap<T> = T;

/** The props of a component, `never` for anything else. Match it against a JSXElementConstructor. */
export type PropsOf<C> = unknown;

/** The type of the elements of an array, `never` for anything else. */
export type ElementOf<T> = unknown;

/** A tuple of `N` items of type `T`. */
export type Tuple<N extends number, T> = T[];

// TODO 4: template literal types

/** A CSS custom property: `--accent`. */
export type CssVar = string;

/** An `rgb(r, g, b)` CSS colour. */
export type RgbColor = string;

/** Every path to a leaf of an object, joined with dots: `'address.city'`. */
export type PathOf<T> = string;

/** The type found at a dotted path. */
export type Get<T, P extends string> = unknown;
