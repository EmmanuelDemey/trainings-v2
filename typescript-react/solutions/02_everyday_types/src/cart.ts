// The cart of a small online shop. Prices are in cents: no floating-point
// surprise on a total.

/** A product of the catalog. */
export interface Product {
  readonly id: string;
  name: string;
  /** In cents. */
  price: number;
  tags: readonly string[];
  /** A percentage off, when the product is on sale. */
  discount?: number;
}

export const CURRENCIES = ['EUR', 'USD', 'GBP'] as const;

export type Currency = (typeof CURRENCIES)[number];

/** The shipping fee, in cents, per currency — every currency, and nothing else. */
export const SHIPPING = {
  EUR: 490,
  USD: 590,
  GBP: 450,
} satisfies Record<Currency, number>;

export function shippingFor(currency: Currency): number {
  return SHIPPING[currency];
}

/** One line of the cart: a product, and how many of it. */
export type CartLine = [product: Product, quantity: number];

/** The price of a line, in cents, its discount applied. */
export function lineTotal([product, quantity]: CartLine): number {
  const discount = product.discount ?? 0;
  return Math.round((product.price * quantity * (100 - discount)) / 100);
}

/** The price of the whole cart, in cents. */
export function cartTotal(...lines: CartLine[]): number {
  return lines.reduce((total, line) => total + lineTotal(line), 0);
}

/** A quantity typed in an `<input>`, or read from the URL: checked before use. */
export function parseQuantity(input: unknown): number {
  const value = typeof input === 'string' && /^\s*\d+\s*$/.test(input) ? Number(input) : input;
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) return value;
  throw new Error(`Invalid quantity: ${String(input)}`);
}
