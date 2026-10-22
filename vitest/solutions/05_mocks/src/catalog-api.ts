export interface BookInfo {
  isbn: string;
  title: string;
  priceInCents: number;
}

/** The shop's catalog service. */
export async function fetchBook(isbn: string): Promise<BookInfo> {
  const response = await fetch(`https://catalog.paper-lantern.example/books/${isbn}`);
  if (response.status === 404) {
    throw new Error(`No book with ISBN ${isbn}`);
  }
  return (await response.json()) as BookInfo;
}
