import { isValidIsbn, normalizeIsbn } from './isbn';

export interface ReceiptLine {
  isbn: string;
  title: string;
  quantity: number;
  priceInCents: number;
}

export interface Receipt {
  lines: ReceiptLine[];
  totalInCents: number;
}

/** What the till prints from the books scanned, in scan order. */
export function buildReceipt(scanned: { isbn: string; title: string; priceInCents: number }[]): Receipt {
  const lines = new Map<string, ReceiptLine>();
  for (const book of scanned) {
    if (!isValidIsbn(book.isbn)) {
      throw new Error(`Invalid ISBN scanned: ${book.isbn}`);
    }
    const isbn = normalizeIsbn(book.isbn);
    const line = lines.get(isbn);
    if (line) {
      line.quantity += 1;
    } else {
      lines.set(isbn, { isbn, title: book.title, quantity: 1, priceInCents: book.priceInCents });
    }
  }
  const all = [...lines.values()];
  return { lines: all, totalInCents: all.reduce((sum, l) => sum + l.quantity * l.priceInCents, 0) };
}
