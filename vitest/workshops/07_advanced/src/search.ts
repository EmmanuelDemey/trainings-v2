import type { StockEntry } from './inventory';

/** Looks an ISBN up in a sorted list, one entry after the other. */
export function linearFind(sorted: StockEntry[], isbn: string): StockEntry | undefined {
  return sorted.find((entry) => entry.isbn === isbn);
}

/** Looks an ISBN up in a list sorted by ISBN, halving it at each step. */
export function binaryFind(sorted: StockEntry[], isbn: string): StockEntry | undefined {
  let low = 0;
  let high = sorted.length - 1;
  while (low <= high) {
    const middle = (low + high) >> 1;
    const entry = sorted[middle]!;
    if (entry.isbn === isbn) return entry;
    if (entry.isbn < isbn) low = middle + 1;
    else high = middle - 1;
  }
  return undefined;
}
