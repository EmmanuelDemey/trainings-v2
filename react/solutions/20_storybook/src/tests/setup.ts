import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setProjectAnnotations } from '@storybook/react-vite';
// `toBeInTheDocument()`, `toHaveValue()`, … on Vitest's `expect`.
import '@testing-library/jest-dom/vitest';
import * as previewAnnotations from '../../.storybook/preview';

// Portable stories: what `.storybook/preview.ts` gives every story in the
// Storybook UI (global decorators, parameters, loaders…) is applied here too,
// so a story renders the same in a spec as it does on screen.
setProjectAnnotations([previewAnnotations]);

// React Testing Library unmounts what it rendered after each test on its own
// only when Vitest runs with `globals: true`. Without globals, it is done here.
afterEach(() => {
  cleanup();
});
