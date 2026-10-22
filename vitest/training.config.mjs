// The one file training-kit reads: https://www.npmjs.com/package/@emmanueldemey/training-kit
import { defineConfig } from '@emmanueldemey/training-kit';

export default defineConfig({
  title: 'Vitest',
  slug: 'vitest',
  author: 'Emmanuel Demey',

  // One Markdown file per chapter, in the order of its number. The end-of-day
  // retro lives in slides/shared/ — a sub-folder, so not a chapter — and is
  // imported at the end of the last chapter.
  slides: 'slides',
  workshops: 'workshops',
  solutions: 'solutions',

  // The online editor (StackBlitz) on each workshop page, loaded with the
  // workshop folder: the specs are the exercise, so the editor opens on them,
  // in watch mode.
  playground: {
    template: 'node',
    openFile: ['README.md'],
    extraFiles: {
      '.stackblitzrc': `${JSON.stringify({ installDependencies: true, startCommand: 'npm run test:watch' }, null, 2)}\n`,
    },
    limits: '`npm test`, `npm run test:watch` and `npm run typecheck` run online. `npm run test:ui` and `npm run dev` (workshop 6) need a local clone.',
  },

  repository: { url: 'https://github.com/EmmanuelDemey/trainings-v2', branch: 'main', dir: 'vitest' },

  deck: {
    theme: 'seriph',
    headmatter: {
      background: 'https://source.unsplash.com/collection/94734566/1920x1080',
      class: 'text-center',
      highlighter: 'shiki',
      lineNumbers: true,
      info: '## Vitest\nVitest training — 1 day, based on Vitest 5 and Vue 3.5.\n',
      drawings: { persist: false },
      transition: 'slide-left',
      css: 'unocss',
    },
  },
});
