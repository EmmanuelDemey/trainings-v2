// TODO — Step 4. `npm run bench`: compare linearFind and binaryFind on a
// catalog of 50 000 books, looking up the last one, and assert which is faster.
import { expect, test } from 'vitest';
import type { StockEntry } from '../src/inventory';
import { binaryFind, linearFind } from '../src/search';

test.todo('binary search beats a linear scan on a big catalog');
