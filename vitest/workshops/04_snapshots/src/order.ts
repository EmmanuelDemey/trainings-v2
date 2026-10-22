export interface OrderLine {
  isbn: string;
  title: string;
  quantity: number;
  priceInCents: number;
}

export interface Order {
  id: string;
  createdAt: Date;
  customer: string;
  lines: OrderLine[];
  coupon: string | null;
  subtotalInCents: number;
  discountInCents: number;
  totalInCents: number;
}

/**
 * An order as the shop records it: a fresh id, the time it was placed, and the
 * amounts worked out once and for all.
 */
export function createOrder(customer: string, lines: OrderLine[], discount?: { coupon: string; inCents: number }): Order {
  const subtotalInCents = lines.reduce((sum, line) => sum + line.quantity * line.priceInCents, 0);
  const discountInCents = discount?.inCents ?? 0;
  return {
    id: crypto.randomUUID(),
    createdAt: new Date(),
    customer,
    lines,
    coupon: discount?.coupon ?? null,
    subtotalInCents,
    discountInCents,
    totalInCents: subtotalInCents - discountInCents,
  };
}
