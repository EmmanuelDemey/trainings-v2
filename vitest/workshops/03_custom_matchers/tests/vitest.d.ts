// What TypeScript knows of the matchers registered in tests/setup.ts. Without
// it, `expect(isbn).toBeValidIsbn()` would not compile.
import 'vitest';

declare module 'vitest' {
  interface Matchers<R, T> {
    /** An ISBN-13 whose check digit adds up — hyphens and spaces allowed. */
    toBeValidIsbn: () => R;
    /** A receipt whose total is exactly `expected` cents, and agrees with its lines. */
    toTotal: (expected: number) => R;
  }
}
