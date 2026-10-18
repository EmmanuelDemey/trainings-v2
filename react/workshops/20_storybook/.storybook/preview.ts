import type { Preview } from '@storybook/react-vite';

// TODO 1.4: import the app's global styles (src/styles.css), and center the
// components in the canvas with the `layout` parameter.
const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
