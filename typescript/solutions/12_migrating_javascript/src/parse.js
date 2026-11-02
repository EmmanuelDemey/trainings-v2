// The CSV export of the shop, one order line per row.

/** @import { Line } from './cart.js' */

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
