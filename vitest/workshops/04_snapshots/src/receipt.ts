import type { Order } from './order';

const WIDTH = 40;

function euros(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

/** A left part and a right part, padded with dots to the width of the ticket. */
function row(left: string, right: string): string {
  return `${left} ${'.'.repeat(Math.max(1, WIDTH - left.length - right.length - 2))} ${right}`;
}

/** The ticket the till prints: one row per line, then the totals. */
export function formatReceipt(order: Order): string {
  const rows = [
    'THE PAPER LANTERN — BOOKSHOP'.padStart(34),
    '='.repeat(WIDTH),
    ...order.lines.map((line) => row(`${line.quantity} × ${line.title}`, euros(line.quantity * line.priceInCents))),
    '-'.repeat(WIDTH),
    row('Subtotal', euros(order.subtotalInCents)),
  ];
  if (order.coupon !== null) {
    rows.push(row(`Coupon ${order.coupon}`, `-${euros(order.discountInCents)}`));
  }
  rows.push(row('TOTAL', euros(order.totalInCents)), '='.repeat(WIDTH));
  return rows.join('\n');
}
