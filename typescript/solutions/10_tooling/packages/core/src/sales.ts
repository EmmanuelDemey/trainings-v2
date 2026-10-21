export interface Sale {
  sku: string;
  amount: number;
  region?: string;
}

export interface ReportOptions {
  /** Default: `'EUR'`. */
  currency?: string;
  /** Default: `2`. */
  decimals?: number;
}

/** The average amount of the sales — `0` when there are none. */
export function average(sales: Sale[]): number {
  if (sales.length === 0) return 0;
  return sales.reduce((sum, sale) => sum + sale.amount, 0) / sales.length;
}

/** The sku of the biggest sale — `undefined` when there are none. */
export function topSeller(sales: Sale[]): string | undefined {
  const sorted = [...sales].sort((a, b) => b.amount - a.amount);
  return sorted[0]?.sku;
}

/** The total per region; a sale without one counts as `'unknown'`. */
export function totalsByRegion(sales: Sale[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const sale of sales) {
    const region = sale.region ?? 'unknown';
    totals[region] = (totals[region] ?? 0) + sale.amount;
  }
  return totals;
}

/** `Total: 42.00 EUR` */
export function formatTotal(sales: Sale[], options: ReportOptions = {}): string {
  const { currency, decimals } = { currency: 'EUR', decimals: 2, ...options };
  const total = sales.reduce((sum, sale) => sum + sale.amount, 0);
  return `Total: ${total.toFixed(decimals)} ${currency}`;
}

/** The report, set up from environment variables: `CURRENCY`. */
export function formatTotalFromEnv(sales: Sale[], env: Record<string, string | undefined>): string {
  return formatTotal(sales, env.CURRENCY === undefined ? {} : { currency: env.CURRENCY });
}
