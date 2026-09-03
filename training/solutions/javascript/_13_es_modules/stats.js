// Given, complete — the module loaded on demand in step 6.
export function summary(items) {
  if (items.length === 0) return 'Empty cart.';

  const prices = items.map((item) => item.price);
  const average = prices.reduce((sum, value) => sum + value, 0) / prices.length;
  const dearest = items.reduce((best, item) => (item.price > best.price ? item : best));

  return `${items.length} item(s) · average ${average.toFixed(2)} € · dearest: ${dearest.name}`;
}

console.log('stats.js evaluated — this line appears on the FIRST click only');
