import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/vue';
import { afterEach } from 'vitest';

// Testing Library only cleans up on its own when the test functions are
// globals — they are imported here, so the DOM is emptied by hand.
afterEach(() => {
  cleanup();
});
