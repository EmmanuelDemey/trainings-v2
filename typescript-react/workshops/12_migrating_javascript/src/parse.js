// @ts-nocheck
// The CSV export of the shop, one cart line per row — what the "Import" button reads.
//
// TODO 4: remove the directive on the first line, say this function returns a line —
// the `Line` of CartLine.jsx, brought in with a JSDoc `@import` — and fix what the
// checker finds.

/**
 * One row of the CSV export — `Book;1250;2;0.1` — into a line. The discount
 * column is optional.
 */
export function parseLine(csv) {
  const [name, price, quantity, discount] = csv.split(';');
  return { name, price, quantity, discount: discount ?? 0 };
}
