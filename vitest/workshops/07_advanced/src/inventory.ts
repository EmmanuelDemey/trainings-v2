import { readFile, writeFile } from 'node:fs/promises';

export interface StockEntry {
  isbn: string;
  title: string;
  stock: number;
}

/** The shop's stock, kept in a JSON file. */
export class Inventory {
  constructor(private readonly path: string) {}

  async all(): Promise<StockEntry[]> {
    return JSON.parse(await readFile(this.path, 'utf8')) as StockEntry[];
  }

  async find(isbn: string): Promise<StockEntry | undefined> {
    return (await this.all()).find((entry) => entry.isbn === isbn);
  }

  /** Takes `quantity` copies out of the stock. Never below zero. */
  async take(isbn: string, quantity: number): Promise<StockEntry> {
    const all = await this.all();
    const entry = all.find((e) => e.isbn === isbn);
    if (!entry) throw new Error(`Unknown ISBN ${isbn}`);
    if (entry.stock < quantity) throw new Error(`Only ${entry.stock} left of "${entry.title}"`);
    entry.stock -= quantity;
    await writeFile(this.path, JSON.stringify(all, null, 2));
    return entry;
  }
}
