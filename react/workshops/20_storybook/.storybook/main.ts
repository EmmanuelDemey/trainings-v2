import { defineMain } from '@storybook/react-vite/node';

// `defineMain` only types the object — the Storybook 10 way to write main.ts.
export default defineMain({
  // TODO 1.2: where are the stories? Next to their component, in src/ —
  // `*.stories.ts` / `*.stories.tsx` (and `*.mdx` docs pages, if you write some).
  stories: [],
  // TODO 1.3: load the docs addon, '@storybook/addon-docs'.
  addons: [],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
});
