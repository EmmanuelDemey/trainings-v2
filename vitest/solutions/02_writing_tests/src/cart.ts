import type { Book } from './catalog';
import { applyCoupon } from './coupon';

export interface CartLine {
  book: Book;
  quantity: number;
}

export class Cart {
  #lines = new Map<string, CartLine>();
  #coupon: string | null = null;

  /** Adds `quantity` copies. Refuses a quantity < 1, and more than the stock. */
  add(book: Book, quantity = 1): void {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new RangeError(`Invalid quantity: ${quantity}`);
    }
    const inCart = this.#lines.get(book.isbn)?.quantity ?? 0;
    if (inCart + quantity > book.stock) {
      throw new Error(`Only ${book.stock} left of "${book.title}"`);
    }
    this.#lines.set(book.isbn, { book, quantity: inCart + quantity });
  }

  /** Removes the whole line. Removing a book that is not there does nothing. */
  remove(isbn: string): void {
    this.#lines.delete(isbn);
  }

  /** The number of copies, all books together. */
  count(): number {
    let count = 0;
    for (const line of this.#lines.values()) count += line.quantity;
    return count;
  }

  lines(): CartLine[] {
    return [...this.#lines.values()];
  }

  /** Checks the coupon right away: an unknown or ineligible code throws. */
  applyCoupon(code: string): void {
    applyCoupon(this.subtotalInCents(), code);
    this.#coupon = code;
  }

  subtotalInCents(): number {
    let total = 0;
    for (const { book, quantity } of this.#lines.values()) total += book.priceInCents * quantity;
    return total;
  }

  totalInCents(): number {
    const subtotal = this.subtotalInCents();
    return this.#coupon === null ? subtotal : applyCoupon(subtotal, this.#coupon);
  }

  clear(): void {
    this.#lines.clear();
    this.#coupon = null;
  }
}
