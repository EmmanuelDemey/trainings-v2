// The cart of a small online shop. Prices are in cents: no floating-point
// surprise on a total.

/**
 * TODO 1: a product of the catalog. Its `id` and its `tags` never change once
 * it is created, and `discount` — a percentage off — only exists when the
 * product is on sale.
 */
export interface Product {
  id: string;
  name: string;
  /** In cents. */
  price: number;
  tags: string[];
  discount?: number;
}

/** TODO 2: the currencies the shop sells in — and the type derived from them. */
export const CURRENCIES = ['EUR', 'USD', 'GBP'];

export type Currency = string;

/**
 * TODO 2: the shipping fee, in cents, per currency — every currency, and
 * nothing else, without losing the keys of the object.
 */
export const SHIPPING: Record<string, number> = {
  EUR: 490,
  USD: 590,
  GBP: 450,
};

export function shippingFor(currency: Currency): number {
  return 0;
}

/** TODO 3: one line of the cart — a product, then how many of it. */
export type CartLine = (Product | number)[];

/** TODO 3: the price of a line, in cents, its discount applied. */
export function lineTotal(line: CartLine): number {
  return 0;
}

/** TODO 3: the price of the whole cart, in cents — as many lines as you like. */
export function cartTotal(...lines: CartLine[]): number {
  return 0;
}

/** TODO 4: a quantity typed in an `<input>`, or read from the URL: checked before use. */
export function parseQuantity(input: unknown): number {
  return Number(input);
}
