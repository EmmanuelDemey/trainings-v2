// The one file training-kit reads: https://www.npmjs.com/package/@emmanueldemey/training-kit
import { defineConfig } from '@emmanueldemey/training-kit';

export default defineConfig({
  title: 'Advanced Vue.js',
  // Keeps the names of the downloads the previous site published:
  // vuejs-advanced-slides.pdf, vuejs-advanced-workshops.pdf, …
  slug: 'vuejs-advanced',
  author: 'Emmanuel Demey',

  // One Markdown file per chapter, in the order of its number. The end-of-day
  // retro lives in slides/shared/ — a sub-folder, so not a chapter — and is
  // imported at the end of the last chapter of each day (5, 10 and 17).
  slides: 'slides',
  workshops: 'workshops',
  solutions: 'solutions',

  // The online editor (StackBlitz) on each workshop page, loaded with the
  // workshop folder: each workshop is a Vite project, run as is.
  playground: {
    template: 'node',
    openFile: ['README.md', 'src/App.vue'],
    limits:
      'Vite, `npm test` and `npm run typecheck` run online. Cypress (`npm run e2e`, workshop 12) and the Vue Devtools browser extension need a local clone.',
  },

  repository: { url: 'https://github.com/EmmanuelDemey/trainings-v2', branch: 'main', dir: 'vuejs-advanced' },

  deck: {
    theme: 'seriph',
    headmatter: {
      background: 'https://source.unsplash.com/collection/94734566/1920x1080',
      class: 'text-center',
      highlighter: 'shiki',
      lineNumbers: true,
      info: '## Advanced Vue.js\nAdvanced Vue.js training — 3 days, based on Vue 3.5.\n',
      drawings: { persist: false },
      transition: 'slide-left',
      css: 'unocss',
    },
  },
});
