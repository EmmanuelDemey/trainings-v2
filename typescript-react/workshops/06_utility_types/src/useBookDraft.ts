// The state of the "edit book" form: the changes typed so far, and the book they give.
//
// TODO 6: type the draft with the right DTO, and implement `change` and `result`.
import { useState } from 'react';
import type { Book } from './model.ts';

export function useBookDraft(book: Book) {
  const [draft, setDraft] = useState<any>({});

  /** Merges more changes into the draft. */
  function change(changes: any): void {}

  /** The book, with the changes applied. The original is left untouched. */
  const result: Book = book;

  return { draft, change, result };
}
