// The one file training-kit reads: https://www.npmjs.com/package/@emmanueldemey/training-kit
import { defineConfig } from '@emmanueldemey/training-kit';

export default defineConfig({
  title: 'TanStack Query for Vue',
  slug: 'tanstack-query-vue',
  author: 'Emmanuel Demey',

  // One Markdown file per chapter, in the order of its number. What the three
  // TanStack Query trainings (React, Angular, Vue) have in common is NOT here:
  // the chapters import it from ../tanstack-query-common/slides/ with Slidev's
  // `src:`, and the workshops get the fake API and the specs from the sync
  // (`pnpm run sync`, run by `postinstall` and `build`).
  slides: 'slides',
  workshops: 'workshops',
  solutions: 'solutions',

  // The online editor (StackBlitz) on each workshop page, loaded with the
  // workshop folder: each workshop is a Vite project, run as is — the synced
  // copies of the API and of the specs included.
  playground: {
    template: 'node',
    openFile: ['README.md', 'src/App.vue'],
    limits:
      'Vite, `npm test` and `npm run typecheck` run online, and so does the TanStack Query devtools panel. The Vue Devtools browser extension needs a local clone.',
  },

  repository: { url: 'https://github.com/EmmanuelDemey/trainings-v2', branch: 'main', dir: 'tanstack-query-vue' },

  deck: {
    theme: 'seriph',
    headmatter: {
      background: 'https://source.unsplash.com/collection/94734566/1920x1080',
      class: 'text-center',
      highlighter: 'shiki',
      lineNumbers: true,
      info: '## TanStack Query for Vue\nTanStack Query for Vue — 1 day, based on TanStack Query 5 and Vue 3.5.\n',
      drawings: { persist: false },
      transition: 'slide-left',
      css: 'unocss',
    },
  },
});
