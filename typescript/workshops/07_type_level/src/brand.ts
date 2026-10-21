// Branded types: two `string`s the compiler tells apart.

// TODO 5: a `T` tagged with `B`, so that a plain `T` is not assignable to it.
export type Brand<T, B extends string> = T;

export type UserId = Brand<string, 'UserId'>;
export type OrderId = Brand<string, 'OrderId'>;

/** TODO 6: the only way to get a UserId — a string checked to start with `u_`. */
export function userId(value: string): UserId {
  return value;
}

/** TODO 6: the only way to get an OrderId — a string checked to start with `o_`. */
export function orderId(value: string): OrderId {
  return value;
}
