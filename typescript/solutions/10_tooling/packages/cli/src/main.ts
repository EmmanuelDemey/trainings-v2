// `npm start` — the CLI, run as is by Node.js. It imports the core package
// from its sources: TypeScript checks it against the core's declarations.
import { average, formatTotalFromEnv, topSeller, totalsByRegion, type Sale } from '../../core/src/index.ts';

const sales: Sale[] = [
  { sku: 'book', amount: 20, region: 'north' },
  { sku: 'pen', amount: 2 },
  { sku: 'lamp', amount: 35, region: 'south' },
];

console.log(formatTotalFromEnv(sales, process.env));
console.log('average:', average(sales).toFixed(2));
console.log('top seller:', topSeller(sales) ?? 'none');
console.log('by region:', totalsByRegion(sales));
