import type { Book } from './model.ts';

export async function fetchBook(id: string, options: { signal?: AbortSignal } = {}): Promise<Book | undefined> {
  options.signal?.throwIfAborted();
  return id === '' ? undefined : { id, title: 'Dune', author: 'Frank Herbert', genre: 'novel', publishedAt: new Date('1965-08-01'), tags: [] };
}
