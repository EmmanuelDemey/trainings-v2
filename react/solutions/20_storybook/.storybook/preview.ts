import type { Preview } from '@storybook/react-vite';
// The app's global styles, so a story looks like the component does in the app.
import '../src/styles.css';

const preview: Preview = {
  parameters: {
    // Center the components in the canvas instead of gluing them to the corner.
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
