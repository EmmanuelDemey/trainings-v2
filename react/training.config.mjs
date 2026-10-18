// The one file training-kit reads: https://www.npmjs.com/package/@emmanueldemey/training-kit
import { defineConfig } from '@emmanueldemey/training-kit';

export default defineConfig({
  title: 'React',
  // Prefixes the downloads: react-slides.pdf, react-workshops.pdf, …
  slug: 'react',
  author: 'Emmanuel Demey, Nicolas Laval',

  // One Markdown file per chapter, in the order of its number. The end-of-day
  // retro lives in slides/shared/ — a sub-folder, so not a chapter — and is
  // imported at the end of the last chapter of each day.
  slides: 'slides',
  workshops: 'workshops',
  solutions: 'solutions',

  // The online editor (StackBlitz) on each workshop page, loaded with the
  // workshop folder: each workshop is a Vite project, run as is.
  playground: {
    template: 'node',
    openFile: ['README.md', 'src/App.tsx'],
    limits:
      'Vite, `npm test` and `npm run typecheck` run online. Cypress (workshop 21), Docker (workshop 22) and the React Developer Tools browser extension need a local clone.',
  },

  repository: { url: 'https://github.com/EmmanuelDemey/trainings-v2', branch: 'main', dir: 'react' },

  deck: {
    theme: 'seriph',
    headmatter: {
      background: 'https://source.unsplash.com/collection/94734566/1920x1080',
      class: 'text-center',
      highlighter: 'shiki',
      lineNumbers: true,
      info: '## React\nReact training — 3 days, based on React 19.\n',
      drawings: { persist: false },
      transition: 'slide-left',
      css: 'unocss',
    },
  },
});
