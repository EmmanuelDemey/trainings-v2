import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test as base } from 'vitest';
import { Inventory, type StockEntry } from '../src/inventory';

export const STOCK: StockEntry[] = [
  { isbn: '9780132350884', title: 'Clean Code', stock: 3 },
  { isbn: '9780134685991', title: 'Effective Java', stock: 1 },
  { isbn: '9782070360024', title: "L'Étranger", stock: 12 },
];

/**
 * TODO — Step 1.
 * - `folder`: a fresh temporary folder (mkdtemp), removed after the test (onCleanup)
 * - `inventory`: STOCK written to `stock.json` in that folder, and an Inventory on it
 */
export const test = base
  .extend('folder', async (): Promise<string> => {
    throw new Error('TODO — Step 1: the folder fixture');
  })
  .extend('inventory', async ({ folder }): Promise<Inventory> => {
    throw new Error(`TODO — Step 1: the inventory fixture, in ${folder}`);
  });
