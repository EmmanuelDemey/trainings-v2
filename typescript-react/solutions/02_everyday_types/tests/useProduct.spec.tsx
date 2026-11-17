import type { ReactNode } from 'react';
import { describe, expect, test } from 'vitest';
import { renderHook } from '@testing-library/react';
import { CatalogContext, useProduct } from '../src/useProduct.ts';
import { catalog, coffee, milk, tea } from './fixtures.ts';

function wrapper({ children }: { children: ReactNode }) {
  return <CatalogContext value={catalog}>{children}</CatalogContext>;
}

describe('useProduct', () => {
  test('finds one product by its id', () => {
    const { result } = renderHook(() => useProduct('tea'), { wrapper });
    expect(result.current).toBe(tea);
  });

  test('gives undefined for an unknown id', () => {
    const { result } = renderHook(() => useProduct('beer'), { wrapper });
    expect(result.current).toBeUndefined();
  });

  test('finds several products from a list of ids', () => {
    const { result } = renderHook(() => useProduct(['milk', 'beer', 'coffee']), { wrapper });
    expect(result.current).toEqual([milk, coffee]);
  });
});
