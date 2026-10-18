import { defineMain } from '@storybook/react-vite/node';

// `defineMain` only types the object — the Storybook 10 way to write main.ts.
export default defineMain({
  // Stories live next to their component, so they move (and get deleted) with it.
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  // Docs: the autodocs page generated for every component tagged 'autodocs'.
  // Controls, actions, viewport, backgrounds… are built into Storybook 10.
  addons: ['@storybook/addon-docs'],
  // Storybook reuses THIS project's vite.config.ts: same plugins, same aliases.
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
});
