// The one file training-kit reads: https://www.npmjs.com/package/@emmanueldemey/training-kit
import { defineConfig } from '@emmanueldemey/training-kit';

export default defineConfig({
  title: 'TypeScript for React developers',
  slug: 'typescript-react',
  author: 'Emmanuel Demey',

  // One Markdown file per chapter, in the order of its number. The slides
  // without code — and the end-of-day retro, imported at the end of chapters 5
  // and 10 — live in ../typescript-common/slides/, shared with the other
  // TypeScript training. See ../typescript-common/README.md.
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

  repository: { url: 'https://github.com/EmmanuelDemey/trainings-v2', branch: 'main', dir: 'typescript-react' },

  deck: {
    theme: 'seriph',
    headmatter: {
      background: 'https://source.unsplash.com/collection/94734566/1920x1080',
      class: 'text-center',
      highlighter: 'shiki',
      lineNumbers: true,
      info: '## TypeScript for React developers\nTypeScript training with React examples — 2 days, based on TypeScript 7 and React 19.\n',
      drawings: { persist: false },
      transition: 'slide-left',
      css: 'unocss',
    },
  },
});
