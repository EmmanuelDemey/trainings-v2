// Branded types: two `string`s the compiler tells apart.

declare const brand: unique symbol;

/** A `T` tagged with `B`: a plain `T` is not assignable to it. */
export type Brand<T, B extends string> = T & { readonly [brand]: B };

export type UserId = Brand<string, 'UserId'>;
export type OrderId = Brand<string, 'OrderId'>;

/** The only way to get a UserId: a string checked to start with `u_`. */
export function userId(value: string): UserId {
  if (!/^u_\w+$/.test(value)) throw new Error(`Not a user id: ${value}`);
  return value as UserId;
}

/** The only way to get an OrderId: a string checked to start with `o_`. */
export function orderId(value: string): OrderId {
  if (!/^o_\w+$/.test(value)) throw new Error(`Not an order id: ${value}`);
  return value as OrderId;
}
