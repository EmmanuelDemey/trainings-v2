// Type-level tools, written from scratch: mapped, conditional, template literal
// and recursive types.

/** Every property readonly, at every depth — arrays included. */
export type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

/** The opposite of Readonly: every property writable again. */
export type Mutable<T> = { -readonly [K in keyof T]: T[K] };

/** Only the keys listed are optional; the others are kept as they are. */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** `{ onAdd: (payload) => void, … }` — one handler per event, named after it. */
export type Handlers<Events> = {
  [K in keyof Events & string as `on${Capitalize<K>}`]: (payload: Events[K]) => void;
};

/** The keys whose value is a function. */
export type MethodKeys<T> = { [K in keyof T]: T[K] extends (...args: never[]) => unknown ? K : never }[keyof T];

/** The type a Promise resolves to — unwrapped as deep as it goes. */
export type Unwrap<T> = T extends PromiseLike<infer Inner> ? Unwrap<Inner> : T;

/** The type of the elements of an array, `never` for anything else. */
export type ElementOf<T> = T extends readonly (infer E)[] ? E : never;

/** A tuple of `N` items of type `T`. */
export type Tuple<N extends number, T, Acc extends T[] = []> = Acc['length'] extends N
  ? Acc
  : Tuple<N, T, [...Acc, T]>;

/** Every path to a leaf of an object, joined with dots: `'address.city'`. */
export type PathOf<T> = {
  [K in keyof T & string]: T[K] extends object ? `${K}.${PathOf<T[K]>}` : K;
}[keyof T & string];

/** The type found at a dotted path. */
export type Get<T, P extends string> = P extends `${infer Head}.${infer Rest}`
  ? Head extends keyof T
    ? Get<T[Head], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never;

/** An `rgb(r, g, b)` CSS colour. */
export type RgbColor = `rgb(${number}, ${number}, ${number})`;
