import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
// `toBeInTheDocument()`, `toHaveValue()`, … on Vitest's `expect`.
import '@testing-library/jest-dom/vitest';

// React Testing Library unmounts what it rendered after each test on its own
// only when Vitest runs with `globals: true`. Without globals, it is done here.
afterEach(() => {
  cleanup();
});
