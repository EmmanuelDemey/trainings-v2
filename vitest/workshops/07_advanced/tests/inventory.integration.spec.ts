import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect } from 'vitest';
import { test } from './fixtures';

describe('Inventory', () => {
  test('reads the stock file', async ({ inventory }) => {
    expect(await inventory.find('9780132350884')).toEqual({ isbn: '9780132350884', title: 'Clean Code', stock: 3 });
  });

  test('takes copies out of the stock, on disk', async ({ inventory, folder }) => {
    await inventory.take('9780132350884', 2);

    const onDisk = JSON.parse(await readFile(join(folder, 'stock.json'), 'utf8'));
    expect(onDisk[0]).toMatchObject({ isbn: '9780132350884', stock: 1 });
  });

  test('starts each test from the same stock', async ({ inventory }) => {
    expect((await inventory.find('9780132350884'))?.stock).toBe(3);
  });

  test('refuses to take more than the stock', async ({ inventory }) => {
    await expect(inventory.take('9780134685991', 2)).rejects.toThrow('Only 1 left of "Effective Java"');
  });

  test('refuses an unknown ISBN', async ({ inventory }) => {
    await expect(inventory.take('9780000000000', 1)).rejects.toThrow('Unknown ISBN 9780000000000');
  });
});

describe('the folder fixture', () => {
  let previous = '';

  test('creates a folder', ({ folder }) => {
    previous = folder;
    expect(existsSync(folder)).toBe(true);
  });

  test('removes it after the test', () => {
    expect(previous).not.toBe('');
    expect(existsSync(previous)).toBe(false);
  });
});
