/** The check digit of an ISBN-13, from its first 12 digits. */
export function isbn13CheckDigit(first12: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i += 1) {
    sum += Number(first12[i]) * (i % 2 === 0 ? 1 : 3);
  }
  return (10 - (sum % 10)) % 10;
}

/** "978-0-13-235088-4" → "9780132350884". */
export function normalizeIsbn(isbn: string): string {
  return isbn.replace(/[\s-]/g, '');
}

/** 13 digits, hyphens and spaces allowed, and a check digit that adds up. */
export function isValidIsbn(isbn: string): boolean {
  const digits = normalizeIsbn(isbn);
  return /^\d{13}$/.test(digits) && isbn13CheckDigit(digits) === Number(digits[12]);
}
