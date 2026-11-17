// The catalog, handed down by a context — and the hook that looks products up in it.
import { createContext, use } from 'react';
import type { Product } from './cart.ts';

export const CatalogContext = createContext<readonly Product[]>([]);

/** One id gives one product — or none. A list of ids gives the products found. */
export function useProduct(id: string): Product | undefined;
export function useProduct(ids: readonly string[]): Product[];
export function useProduct(query: string | readonly string[]): Product | Product[] | undefined {
  const catalog = use(CatalogContext);
  if (typeof query === 'string') return catalog.find((product) => product.id === query);
  return catalog.filter((product) => query.includes(product.id));
}
