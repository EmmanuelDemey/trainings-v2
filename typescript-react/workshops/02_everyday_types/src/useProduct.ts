// The catalog, handed down by a context — and the hook that looks products up in it.
import { createContext, use } from 'react';
import type { Product } from './cart.ts';

export const CatalogContext = createContext<readonly Product[]>([]);

/** TODO 5: one id gives one product — or none. A list of ids gives the products found. */
export function useProduct(query: string | readonly string[]): any {
  const catalog = use(CatalogContext);
  return undefined;
}
