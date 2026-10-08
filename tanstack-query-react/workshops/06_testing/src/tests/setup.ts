import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// React Testing Library unmounts what it rendered after each test on its own
// only when Vitest runs with `globals: true`. Without globals, it is done here:
// an app left mounted would keep its queries — and their requests — alive in
// the next test.
afterEach(() => {
  cleanup();
});
