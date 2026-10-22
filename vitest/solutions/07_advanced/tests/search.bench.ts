// `npm run bench` — not part of `npm test`: timings are not pass or fail on a
// shared CI machine. Only how the two compare is asserted.
import { expect, test } from 'vitest';
import type { StockEntry } from '../src/inventory';
import { binaryFind, linearFind } from '../src/search';

const catalog: StockEntry[] = Array.from({ length: 50_000 }, (_, i) => ({
  isbn: `978${String(i).padStart(10, '0')}`,
  title: `Book ${i}`,
  stock: i % 7,
}));
const last = catalog.at(-1)!.isbn;

test('binary search beats a linear scan on a big catalog', async ({ bench }) => {
  const result = await bench.compare(
    bench('linearFind', () => {
      linearFind(catalog, last);
    }),
    bench('binaryFind', () => {
      binaryFind(catalog, last);
    }),
  );

  expect(result.get('binaryFind')).toBeFasterThan(result.get('linearFind'));
});
