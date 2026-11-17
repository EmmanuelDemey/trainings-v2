// The report of a list of sales: its total, its average, its top seller, and a
// total per region.
import { average, formatTotal, topSeller, totalsByRegion, type Sale } from './sales.ts';

export interface SalesReportProps {
  sales: Sale[];
  /** Default: the one of `formatTotal`, `'EUR'`. */
  currency?: string;
}

export function SalesReport({ sales, currency }: SalesReportProps) {
  return (
    <section aria-label="Sales">
      <p>{formatTotal(sales, { currency })}</p>
      <p>Average: {average(sales).toFixed(2)}</p>
      <p>Top seller: {topSeller(sales) ?? 'none'}</p>
      <ul aria-label="By region">
        {Object.entries(totalsByRegion(sales)).map(([region, total]) => (
          <li key={region}>
            {region}: {total}
          </li>
        ))}
      </ul>
    </section>
  );
}
