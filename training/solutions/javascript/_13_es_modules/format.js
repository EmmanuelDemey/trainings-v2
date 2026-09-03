// Everything about displaying a value. Imported by app.js and cart-item.js.
const CURRENCY = 'EUR';

// Not exported: private to this module. Nobody outside can reach it.
const formatter = new Intl.NumberFormat('en-GB', { style: 'currency', currency: CURRENCY });

export function price(amount) {
  return formatter.format(amount);
}

export function plural(count, word) {
  return `${count} ${word}${count > 1 ? 's' : ''}`;
}
