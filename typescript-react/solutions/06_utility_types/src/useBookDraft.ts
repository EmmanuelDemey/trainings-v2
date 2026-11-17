// The state of the "edit book" form: the changes typed so far, and the book they give.
import { useState } from 'react';
import type { Book } from './model.ts';
import type { BookDraft } from './dto.ts';

export function useBookDraft(book: Book) {
  const [draft, setDraft] = useState<BookDraft>({});

  /** Merges more changes into the draft. */
  function change(changes: BookDraft): void {
    setDraft((current) => ({ ...current, ...changes }));
  }

  /** The book, with the changes applied. The original is left untouched. */
  const result: Book = { ...book, ...draft };

  return { draft, change, result };
}
