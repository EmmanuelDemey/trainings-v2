// `npm run dev` — the report, rendered by Vite in the browser.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SalesReport } from './SalesReport.tsx';
import type { Sale } from './sales.ts';

const sales: Sale[] = [
  { sku: 'book', amount: 20, region: 'north' },
  { sku: 'pen', amount: 2 },
  { sku: 'lamp', amount: 35, region: 'south' },
];

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <SalesReport sales={sales} />
    </StrictMode>,
  );
}
