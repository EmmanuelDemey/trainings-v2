export interface Book {
  isbn: string;
  title: string;
  author: string;
  priceInCents: number;
  stock: number;
}

/** What the shop sells. A fresh copy each time: tests can change it at will. */
export function createCatalog(): Book[] {
  return [
    { isbn: '9780132350884', title: 'Clean Code', author: 'Robert C. Martin', priceInCents: 3990, stock: 3 },
    { isbn: '9780134685991', title: 'Effective Java', author: 'Joshua Bloch', priceInCents: 4500, stock: 1 },
    { isbn: '9782070360024', title: "L'Étranger", author: 'Albert Camus', priceInCents: 790, stock: 12 },
    { isbn: '9780262033848', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', priceInCents: 9900, stock: 0 },
  ];
}
