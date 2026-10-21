// The one file training-kit reads: https://www.npmjs.com/package/@emmanueldemey/training-kit
import { defineConfig } from '@emmanueldemey/training-kit';

export default defineConfig({
  title: 'TypeScript',
  slug: 'typescript',
  author: 'Emmanuel Demey',

  // One Markdown file per chapter, in the order of its number. The end-of-day
  // retro lives in slides/shared/ — a sub-folder, so not a chapter — and is
  // imported at the end of the last chapter of each day (5 and 10).
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
    limits: '`npm test`, `npm run test:watch` and `npm run typecheck` run online, as does `npm start`.',
  },

  repository: { url: 'https://github.com/EmmanuelDemey/trainings-v2', branch: 'main', dir: 'typescript' },

  deck: {
    theme: 'seriph',
    headmatter: {
      background: 'https://source.unsplash.com/collection/94734566/1920x1080',
      class: 'text-center',
      highlighter: 'shiki',
      lineNumbers: true,
      info: '## TypeScript\nTypeScript training — 2 days, based on TypeScript 7.\n',
      drawings: { persist: false },
      transition: 'slide-left',
      css: 'unocss',
    },
  },
});
