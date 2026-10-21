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

/** `12.50 €`, `$12.50` or `£12.50`. */
export function formatPrice(cents: number, currency: Currency = 'EUR'): string {
  const amount = (cents / 100).toFixed(2);
  switch (currency) {
    case 'EUR':
      return `${amount} €`;
    case 'USD':
      return `$${amount}`;
    case 'GBP':
      return `£${amount}`;
  }
}

/** A quantity typed by a user, or read from a query string: checked before use. */
export function parseQuantity(input: unknown): number {
  const value = typeof input === 'string' && /^\s*\d+\s*$/.test(input) ? Number(input) : input;
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) return value;
  throw new Error(`Invalid quantity: ${String(input)}`);
}

/** One id gives one product — or none. A list of ids gives the products found. */
export function findProduct(catalog: readonly Product[], id: string): Product | undefined;
export function findProduct(catalog: readonly Product[], ids: readonly string[]): Product[];
export function findProduct(
  catalog: readonly Product[],
  query: string | readonly string[],
): Product | Product[] | undefined {
  if (typeof query === 'string') return catalog.find((product) => product.id === query);
  return catalog.filter((product) => query.includes(product.id));
}

/** Holds a product in stock for the time of a checkout; `using` releases it. */
export function reserveStock(product: Product, log: string[]): Disposable {
  log.push(`reserved ${product.id}`);
  return {
    [Symbol.dispose]() {
      log.push(`released ${product.id}`);
    },
  };
}
