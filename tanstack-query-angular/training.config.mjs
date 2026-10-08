// The one file training-kit reads: https://www.npmjs.com/package/@emmanueldemey/training-kit
import { defineConfig } from '@emmanueldemey/training-kit';

export default defineConfig({
  title: 'TanStack Query for Angular',
  // Prefixes the downloads: tanstack-query-angular-slides.pdf, …
  slug: 'tanstack-query-angular',
  author: 'Emmanuel Demey',

  // One Markdown file per chapter, in the order of its number. What the React,
  // Angular and Vue trainings share — the concepts, the retro — lives in
  // ../tanstack-query-common/slides/ and is imported by the chapters with
  // Slidev's `src:`. Only the Angular adapter is written here.
  slides: 'slides',
  workshops: 'workshops',
  solutions: 'solutions',

  // The online editor (StackBlitz) on each workshop page, loaded with the
  // workshop folder: each workshop is an Angular CLI project, run as is.
  playground: {
    template: 'node',
    openFile: ['README.md', 'src/app/app.ts'],
    limits:
      '`npm run dev` (`ng serve`), `npm run build` and `npm run typecheck` run online. `npm test` (`ng test`: Vitest and jsdom in Node.js) is checked locally and in the CI only — if it misbehaves in the online editor, use a local clone. The TanStack Query devtools are the floating panel of the app itself: no browser extension to install.',
  },

  repository: { url: 'https://github.com/EmmanuelDemey/trainings-v2', branch: 'main', dir: 'tanstack-query-angular' },

  deck: {
    theme: 'seriph',
    headmatter: {
      background: 'https://source.unsplash.com/collection/94734566/1920x1080',
      class: 'text-center',
      highlighter: 'shiki',
      lineNumbers: true,
      info: '## TanStack Query for Angular\nTanStack Query for Angular — 1 day, based on TanStack Query 5 and Angular 22.\n',
      drawings: { persist: false },
      transition: 'slide-left',
      css: 'unocss',
    },
  },
});
