// The one file training-kit reads: https://www.npmjs.com/package/@emmanueldemey/training-kit
import { defineConfig } from '@emmanueldemey/training-kit';

export default defineConfig({
  title: 'Zod',
  slug: 'zod',
  author: 'Emmanuel Demey',

  // One Markdown file per chapter, in the order of its number. The end-of-session
  // retro lives in slides/shared/ — a sub-folder, so not a chapter — and is
  // imported at the end of the last chapter.
  slides: 'slides',
  workshops: 'workshops',
  solutions: 'solutions',

  // The online editor (StackBlitz) on each workshop page, loaded with the
  // workshop folder: each workshop is a plain TypeScript project whose specs
  // are the exercise, so the editor opens on them, in watch mode.
  playground: {
    template: 'node',
    openFile: ['README.md'],
    extraFiles: {
      '.stackblitzrc': `${JSON.stringify({ installDependencies: true, startCommand: 'npm run test:watch' }, null, 2)}\n`,
    },
    limits: '`npm test`, `npm run test:watch` and `npm run typecheck` run online, as does `npm start` in workshop 4.',
  },

  repository: { url: 'https://github.com/EmmanuelDemey/trainings-v2', branch: 'main', dir: 'zod' },

  deck: {
    theme: 'seriph',
    headmatter: {
      background: 'https://source.unsplash.com/collection/94734566/1920x1080',
      class: 'text-center',
      highlighter: 'shiki',
      lineNumbers: true,
      info: '## Zod\nZod training — half a day, based on Zod 4.6.\n',
      drawings: { persist: false },
      transition: 'slide-left',
      css: 'unocss',
    },
  },
});
