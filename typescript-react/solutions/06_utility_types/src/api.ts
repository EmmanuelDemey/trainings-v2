import type { Book } from './model.ts';

/** The loader of the `/books/:id` route. */
export async function bookLoader(id: string, options: { signal?: AbortSignal } = {}): Promise<Book | undefined> {
  options.signal?.throwIfAborted();
  return id === '' ? undefined : { id, title: 'Dune', author: 'Frank Herbert', genre: 'novel', publishedAt: new Date('1965-08-01'), tags: [] };
}
