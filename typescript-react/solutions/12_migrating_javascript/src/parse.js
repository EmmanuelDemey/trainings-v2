// The CSV export of the shop, one cart line per row — what the "Import" button reads.

/** @import { Line } from './CartLine.jsx' */

/**
 * One row of the CSV export — `Book;1250;2;0.1` — into a line. The discount
 * column is optional.
 * @param {string} csv
 * @returns {Line}
 */
export function parseLine(csv) {
  const [name = '', price, quantity, discount] = csv.split(';');
  return { name, price: Number(price), quantity: Number(quantity), discount: Number(discount ?? 0) };
}
