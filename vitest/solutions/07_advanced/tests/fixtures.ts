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
 * `inventory`: a fresh stock file in a temporary folder, removed after the
 * test. A test that does not ask for it creates nothing.
 */
export const test = base
  .extend('folder', async ({}, { onCleanup }) => {
    const folder = await mkdtemp(join(tmpdir(), 'paper-lantern-'));
    onCleanup(() => rm(folder, { recursive: true, force: true }));
    return folder;
  })
  .extend('inventory', async ({ folder }) => {
    const path = join(folder, 'stock.json');
    await writeFile(path, JSON.stringify(STOCK));
    return new Inventory(path);
  });
